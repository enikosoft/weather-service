import {Model} from 'objection';
import {CityModel} from '../cities';
import {WeatherDailyLog, WeatherHourlyLog} from './weather.type';

interface WeatherDailyModel extends WeatherDailyLog {}
interface WeatherHourlyModel extends WeatherHourlyLog {}

class WeatherDailyModel extends Model {
  static get tableName() {
    return 'weather_daily_logs';
  }

  static get virtualAttributes() {
    return ['avgerageTemperature'];
  }

  static get relationMappings() {
    return {
      cities: {
        relation: Model.HasOneRelation,
        modelClass: CityModel,
        join: {
          from: 'weather_daily_logs.city_id',
          to: 'cities.id',
        },
      },
    };
  }
}

class WeatherHourlyModel extends Model {
  static get tableName() {
    return 'weather_hourly_logs';
  }

  static get relationMappings() {
    return {
      cities: {
        relation: Model.HasOneRelation,
        modelClass: CityModel,
        join: {
          from: 'weather_hourly_logs.city_id',
          to: 'cities.id',
        },
      },
    };
  }
}

export {WeatherDailyModel, WeatherHourlyModel};
