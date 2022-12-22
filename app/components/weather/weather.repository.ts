import {EventDispatcher} from 'event-dispatch';
import {InternalServerError} from './../../exceptions/errors';
import {WeatherDailyModel, WeatherHourlyModel} from './weather.model';
import {AvgTemperatureResponse, SearchType, WeatherHourlyLog} from './weather.type';
import {mapDbValuesToResponse} from './utils';
import {events} from './../../events';
import {City} from '../cities';
import Knex from 'knex';
import {config} from './../../config/knex';
import {knexRawPrettier} from './../../utils/knexRawPrettier';

interface DailyWeatherSearchData {
  date: string;
  startDate?: string;
}

export class WeatherRepository {
  private static instance: WeatherRepository;

  private eventDispatcher: EventDispatcher;

  private constructor() {
    this.eventDispatcher = new EventDispatcher();
  }

  static getInstance(): WeatherRepository {
    if (!WeatherRepository.instance) {
      WeatherRepository.instance = new WeatherRepository();
    }

    return WeatherRepository.instance;
  }

  /**
   * Service get daily weather for selected city
   * Has 3 search types:
   *  - period
   *  - date (exact date)
   *  - between date (start and date included)
   */
  async getDailyWeatherForCity(cityId: number, searchType: SearchType, conditions: DailyWeatherSearchData) {
    try {
      const {date, startDate} = conditions;

      return await WeatherDailyModel.query()
        .where({city_id: cityId})
        .context({needLog: true, cityId})
        .modify(function (queryBuilder) {
          if (searchType === SearchType.Period) {
            queryBuilder.whereRaw('??::date = ?', ['datetime', date]);
          } else if (searchType === SearchType.ExactDate) {
            queryBuilder.whereRaw('??::date = ?', ['datetime', date]);
          } else if (searchType === SearchType.DateBetween && startDate) {
            queryBuilder
              .whereRaw('??::date >= ?', ['datetime', startDate])
              .andWhereRaw('??::date <= ?', ['datetime', date]);
          }
        })
        .runAfter((models) => {
          this.eventDispatcher.dispatch(events.city.getWeather, cityId);

          return models.map(mapDbValuesToResponse);
        });
    } catch (e) {
      throw new InternalServerError(e?.message);
    }
  }

  /**
   * Service for getting timeline weather
   */
  async getTimelineWeatherForCity(cityId: number, date: string): Promise<WeatherHourlyLog[]> {
    try {
      return await WeatherHourlyModel.query()
        .where({city_id: cityId})
        .context({needLog: true, cityId})
        .modify(function (queryBuilder) {
          queryBuilder.whereRaw('??::date = ?', ['datetime', date]);
        })
        .orderBy('datetime')
        .runAfter((models) => {
          this.eventDispatcher.dispatch(events.city.getWeather, cityId);

          return models;
        });
    } catch (e) {
      throw new InternalServerError(e?.message);
    }
  }

  /**
   * Service returned avg count of temperature records (all or between conditinal date)
   */
  async getAverageWeatherInCity(cityId: number, conditions?: DailyWeatherSearchData): Promise<AvgTemperatureResponse> {
    try {
      const result = await WeatherDailyModel.query()
        .where({city_id: cityId})
        .modify(function (queryBuilder) {
          if (conditions?.startDate && conditions?.date) {
            queryBuilder
              .whereRaw('??::date >= ?', ['datetime', conditions.startDate])
              .andWhereRaw('??::date <= ?', ['datetime', conditions.date]);
          }
        })
        .avg('temperature')

        .runAfter((models) => {
          this.eventDispatcher.dispatch(events.city.getWeather, cityId);

          return models;
        });

      return {
        avgerageTemperature: Math.floor(Math.round(result[0].avg)),
        ...(conditions?.startDate ? {startDate: conditions?.startDate} : {}),
        ...(conditions?.date ? {endDate: conditions?.date} : {}),
      };
    } catch (e) {
      throw new InternalServerError(e?.message);
    }
  }

  getMostRequestedCity = async (): Promise<City[]> => {
    try {
      const knex = Knex(config.development);

      const result = await knex.raw(`
        WITH aggregated AS (
          SELECT cql.city_id, COUNT(cql.city_id) as count FROM cities_query_log cql
          WHERE cql.type = 'GET_CITY_WEATHER'
          GROUP BY cql.city_id
        )
        
        SELECT cities.*
        FROM aggregated
        LEFT JOIN cities ON cities.id = aggregated.city_id
        WHERE count = (SELECT MAX(count) FROM aggregated);
      
      `);

      return knexRawPrettier<City>(result.rows);
    } catch (error) {
      throw new InternalServerError(error?.message);
    }
  };
}
