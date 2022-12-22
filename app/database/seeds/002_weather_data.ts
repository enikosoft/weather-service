import {City} from '@components/cities';
import {WeatherDailyLog} from '@components/weather';
import {Knex} from 'knex';
import {Model} from 'objection';

import weatherJob, {
  ApiRequestType,
  buildRequestUrl,
  getCitiesForJob,
  saveWeatherDailyLogs,
} from '../../scripts/weather-cron';
import {WeatherHistoryApiResColumns} from '../../scripts/weather-cron/utils';
import {RequestType} from '../../types/requestTypes';
import {Api} from '../../utils/Request';

// Mapped data from api to db data
const mapResultToWeatherHistoryObject = (location: string, data): WeatherDailyLog[] => {
  const weatherData = data?.locations[location]?.values;

  if (!weatherData) return [];

  // filter if city has unavalable weather data
  const checkedData = weatherData.filter((row) => row.info !== 'No data available');

  delete checkedData.datetime;

  return checkedData.map((item) => {
    let weatherObject = {};
    Object.keys(item).map((key) => {
      const fieldName = WeatherHistoryApiResColumns[key]?.fieldName;

      if (!fieldName) return {...weatherObject};
      const fieldValue = item[key];

      if (fieldName === 'datetime' && WeatherHistoryApiResColumns[key]?.id === 'datetime') {
        return (weatherObject = {...weatherObject});
      }

      weatherObject = {
        ...weatherObject,
        [fieldName]: fieldValue,
      };
    });

    return weatherObject;
  });
};

/**
 * Function creates weather api url, get data from it and saves into our db
 * @param cities - list available cities
 */
export const storeWeatherHistory = async (cities: City[]) => {
  if (!cities.length) return;

  await Promise.allSettled(
    cities.map(async (city: City) => {
      const url = buildRequestUrl(city, ApiRequestType.HISTORY_SERVICE);

      const api = new Api(RequestType.GET, url);
      const data = await api.request();

      const location = `${city.name},${city.countryCode}`;

      const weatherHistoryRecords = mapResultToWeatherHistoryObject(location, data);

      if (weatherHistoryRecords.length) {
        const weatherHistoryLogs = weatherHistoryRecords.map((record: WeatherDailyLog) => {
          return {
            city_id: city.id,
            ...record,
          };
        });

        await saveWeatherDailyLogs(weatherHistoryLogs);
      }
    }),
  );
};

export const weatherHistoryMigration = async () => {
  try {
    const cities = await getCitiesForJob();
    await storeWeatherHistory(cities);
  } catch (e) {
    console.error('Weather History Migration error:', e);
  }
};

export async function seed(knex: Knex) {
  Model.knex(knex);

  // set weekly weather history
  await weatherHistoryMigration();

  // job for updating daily weather
  // invoke in migration and than every midnight
  await weatherJob();
}
