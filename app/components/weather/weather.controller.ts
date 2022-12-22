import {NextFunction, Response, Request} from 'express';
import {getSuccessResponse} from './../../types/responseType';
import {BadRequest} from './../../exceptions/errors';
import {WeatherRepository} from './weather.repository';
import {AvgTemperatureResponse, SearchPeriod, SearchType} from './weather.type';
import moment, {MomentInput} from 'moment';
import {WeatherDailyLog, WeatherHourlyLog} from '.';
import {dateFormat, getDateFromPeriod, startDateAndEndDateValidation} from './utils';
import {City} from '../cities';

export class WeatherController {
  weatherRepository: WeatherRepository;

  constructor() {
    this.weatherRepository = WeatherRepository.getInstance();
  }

  /**
   * Get weather daily log for requested date.
   * If date or period not specified, [Today] is by default
   *
   * Parameter weight:
   *  1) period
   *  2) exact date
   *  3) Beetween period
   *  4) Period=today by default
   *
   * ?startDay=2022-12-17&endDate=2022-12-20
   */
  getWeatherForCity = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const cityId = Number(request.params.id);

      const period = request.query?.period as SearchPeriod;

      if (period && !Object.values(SearchPeriod)?.includes(period)) {
        throw new BadRequest(`Period ${period} is incorect. Available only [today, yesterday, 2daysAgo]`);
      }

      // if period was specified, ignore other query params
      if (period) {
        const periodData = await this.weatherRepository.getDailyWeatherForCity(cityId, SearchType.Period, {
          date: getDateFromPeriod(period),
        });

        return response.status(200).json(getSuccessResponse<WeatherDailyLog[]>(periodData, 200));
      }

      // if date was specified, ignore between date (start and end)
      const date = request.query?.date as MomentInput; //'2022-12-20'

      if (date) {
        const momentDate = moment(date, dateFormat, true).isValid() ? moment.utc(date).toISOString() : false;

        if (!momentDate) {
          throw new BadRequest('Date param is invalid. Please, enter the next format: "YYYY-MM-DD"');
        } else {
          const exactDateDate = await this.weatherRepository.getDailyWeatherForCity(cityId, SearchType.ExactDate, {
            date: momentDate,
          });

          return response.status(200).json(getSuccessResponse<WeatherDailyLog[]>(exactDateDate, 200));
        }
      }

      const startDate = request.query?.startDate as MomentInput;
      const endDate = request.query?.endDate as MomentInput;

      const {momentStartDate, momentEndDate} = startDateAndEndDateValidation(startDate, endDate);

      if (momentStartDate && momentEndDate) {
        const weatherLogs = await this.weatherRepository.getDailyWeatherForCity(cityId, SearchType.DateBetween, {
          startDate: momentStartDate as string,
          date: momentEndDate as string,
        });

        return response.status(200).json(getSuccessResponse<WeatherDailyLog[]>(weatherLogs, 200));
      }

      // by default Today
      const defaultData = await this.weatherRepository.getDailyWeatherForCity(cityId, SearchType.Period, {
        date: getDateFromPeriod(SearchPeriod.Today),
      });

      return response.status(200).json(getSuccessResponse<WeatherDailyLog[]>(defaultData, 200));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Timeline weather only for today by city Id
   */
  getTimelineWeatherForCity = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const cityId = Number(request.params.id);
      const today = moment().local().format('YYYY-MM-DD');

      const weatherLogs = await this.weatherRepository.getTimelineWeatherForCity(cityId, today);

      return response.status(200).json(getSuccessResponse<WeatherHourlyLog[]>(weatherLogs, 200));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get average temperature for city.
   * Avg of all weather log records or between specified date (startDate and endDate)
   */
  getAverageWeatherInCity = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const cityId = Number(request.params.id);

      const startDate = request.query?.startDate as MomentInput;
      const endDate = request.query?.endDate as MomentInput;

      const {momentStartDate, momentEndDate} = startDateAndEndDateValidation(startDate, endDate);

      const conditions =
        startDate && endDate
          ? {
              startDate: momentStartDate as string,
              date: momentEndDate as string,
            }
          : undefined;

      const avgResponse = await this.weatherRepository.getAverageWeatherInCity(cityId, conditions);

      return response.status(200).json(getSuccessResponse<AvgTemperatureResponse>(avgResponse, 200));
    } catch (error) {
      next(error);
    }
  };

  /**
   * The weather for which city was asked the most.
   */
  getMostRequestedCity = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.weatherRepository.getMostRequestedCity();

      return response.status(200).json(getSuccessResponse<City[]>(result, 200));
    } catch (error) {
      next(error);
    }
  };
}
