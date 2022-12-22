import {Model} from 'objection';
import City, {CityRequestType} from './city.type';

interface CityModel extends City {}

class CityModel extends Model {
  static get tableName() {
    return 'cities';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name'],

      properties: {
        id: {type: 'integer'},
        name: {type: 'string', minLength: 1, maxLength: 50},
        countryCode: {type: 'string', minLength: 1, maxLength: 5},
        latitude: {type: 'float'},
        longitude: {type: 'float'},
      },
    };
  }
}

export class CityQueryLogModel extends Model {
  static get tableName() {
    return 'cities_query_log';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: {type: 'integer'},
        type: {type: 'string'},
      },
    };
  }
  static get relationMappings() {
    return {
      city: {
        relation: Model.BelongsToOneRelation,
        modelClass: CityModel,
        join: {
          from: 'cities_query_log.city_id',
          to: 'cities.id',
        },
      },
    };
  }
}

export default CityModel;
