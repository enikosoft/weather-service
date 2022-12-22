import {City} from './../../components/cities';
import {WeatherDailyLog, WeatherDailyModel, WeatherHourlyLog, WeatherHourlyModel} from './../../components/weather';
import moment from 'moment';
import momentTimezone from 'moment-timezone';

import {RequestType} from '../../types/requestTypes';
import {Api} from '../../utils/Request';
import {mockHourlyWeatherData, WeatherHistoryApiResColumns} from './utils';

export enum ApiRequestType {
  HISTORY_SERVICE,
  TIMELINE_SERVICE,
}

export const getWaetherApiUrl = (apiRequestType: ApiRequestType) => {
  return `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/${
    apiRequestType === ApiRequestType.TIMELINE_SERVICE ? 'timeline' : 'history'
  }?`;
};

// Weather Outher API Url Params
const PARAMS = {
  aggregateHours: '24',
  unitGroup: 'metric',
  contentType: 'json',
  includeAstronomy: 'true',
  dayStartTime: '0:0:00',
  dayEndTime: '23:0:00',
  timezone: 'Z',
  key: process.env.WEATHER_API_KEY,
};

export const buildRequestUrl = (city: City, apiRequestType: ApiRequestType): string => {
  const endDateTime = moment().subtract(1, 'd').local().format('YYYY-MM-DD');
  const startDateTime = moment().subtract(1, 'w').local().format('YYYY-MM-DD');

  const today = moment().local().format('YYYY-MM-DD');

  const cityParams = {
    ...PARAMS,
    ...(apiRequestType === ApiRequestType.HISTORY_SERVICE ? {startDateTime, endDateTime} : {}),
    ...(apiRequestType === ApiRequestType.TIMELINE_SERVICE ? {startDateTime: today} : {}),
    location: `${city.name},${city.countryCode}`,
    aggregateHours: apiRequestType === ApiRequestType.TIMELINE_SERVICE ? '1' : '24',
  };

  let url = getWaetherApiUrl(apiRequestType);

  Object.keys(cityParams).map((key) => {
    url = `${url}&${key}=${cityParams[key]}`;
  });

  return url;
};

// mapped fetched weather data to daily and hourly weather data
const mapResultToHourlyWeatherObject = (
  data,
): {
  weatherDailyObject?: WeatherDailyLog;
  hourlyWeather?: WeatherHourlyLog[];
} => {
  const weatherDataForToday = data?.days[0];

  if (!weatherDataForToday) return {};

  // map daily weather data
  let weatherDailyObject = {};

  Object.keys(weatherDataForToday).map((key) => {
    const fieldName = WeatherHistoryApiResColumns[key]?.fieldName;

    if (fieldName === 'sunrise') {
      return (weatherDailyObject = {
        ...weatherDailyObject,
        sunrise: moment.unix(weatherDataForToday.sunriseEpoch).tz('Europe/London').toISOString(),
      });
    }

    if (fieldName === 'sunset') {
      return (weatherDailyObject = {
        ...weatherDailyObject,
        sunset: moment.unix(weatherDataForToday.sunsetEpoch).tz('Europe/London').toISOString(),
      });
    }

    if (fieldName === 'datetime') {
      return (weatherDailyObject = {
        ...weatherDailyObject,
        datetime: moment.unix(weatherDataForToday.datetimeEpoch).tz('Europe/London').toISOString(),
      });
    }

    // skip this fields for daily data
    if (['datetimeEpoch', 'feelslike'].includes(fieldName)) {
      return (weatherDailyObject = {
        ...weatherDailyObject,
      });
    }

    if (!fieldName) return {...weatherDailyObject};
    const fieldValue = weatherDataForToday[key];

    weatherDailyObject = {
      ...weatherDailyObject,
      [fieldName]: fieldValue,
    };
  });

  // map daily hourly weather data
  const hourlyWeather = weatherDataForToday?.hours?.map((item) => {
    let weatherObject = {};
    Object.keys(item).map((key) => {
      const fieldName = WeatherHistoryApiResColumns[key]?.fieldName;

      if (fieldName === 'datetime') {
        return (weatherObject = {
          ...weatherObject,
          datetime: momentTimezone.unix(item.datetimeEpoch).tz('Europe/London').toISOString(),
        });
      }

      if (!fieldName) return {...weatherObject};
      const fieldValue = item[key];

      weatherObject = {
        ...weatherObject,
        [fieldName]: fieldValue,
      };
    });

    return weatherObject;
  });

  return {
    weatherDailyObject: weatherDailyObject as WeatherDailyLog,
    hourlyWeather,
  };
};

export const saveWeatherDailyLogs = async (logs: Omit<WeatherDailyLog, 'id'>[]) => {
  try {
    await Promise.allSettled(
      logs.map(async (log: WeatherDailyModel) => {
        await WeatherDailyModel.query().insert(log);
      }),
    );
  } catch (e) {
    console.error(e);
  }
};

const saveWeatherHourlyLogs = async (logs: Omit<WeatherHourlyLog, 'id'>[]) => {
  try {
    await Promise.allSettled(
      logs.map(async (log: WeatherHourlyLog) => {
        await WeatherHourlyModel.query().insert(log);
      }),
    );
  } catch (e) {
    console.error(e);
  }
};

/**
 * Fetch weather data (daily and hourly). Save into db
 * @param cities - cities for fetching weather data
 */
export const storeWeatherData = async (cities: City[]) => {
  try {
    if (!cities.length) return;

    await Promise.allSettled(
      cities.map(async (city: City) => {
        const url = buildRequestUrl(city, ApiRequestType.TIMELINE_SERVICE);

        const api = new Api(RequestType.GET, url);
        const data = await api.request();

        const weatherRecords = mapResultToHourlyWeatherObject(data);

        if (weatherRecords?.weatherDailyObject) {
          let weatherRecord = weatherRecords.weatherDailyObject;
          weatherRecord = {
            ...weatherRecord,
            city_id: city.id,
          };

          await saveWeatherDailyLogs([weatherRecord]);
        }

        if (weatherRecords?.hourlyWeather?.length) {
          const weatherLogs = weatherRecords.hourlyWeather.map((record: WeatherHourlyLog) => {
            return {
              city_id: city.id,
              ...record,
            };
          });

          await saveWeatherHourlyLogs(weatherLogs);
        }
      }),
    );
  } catch (e) {
    console.error(e);
  }
};
