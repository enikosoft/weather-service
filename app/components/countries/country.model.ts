import {Model} from 'objection';
import {CityModel} from '../cities';

class Country extends Model {
  static get tableName() {
    return 'countries';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name'],

      properties: {
        id: {type: 'integer'},
        name: {type: 'string', minLength: 1, maxLength: 50},
        region: {type: 'string', minLength: 1, maxLength: 150},
        iso3: {type: 'string', minLength: 1, maxLength: 5},
      },
    };
  }

  static get relationMappings() {
    return {
      cities: {
        relation: Model.HasManyRelation,
        modelClass: CityModel,
        join: {
          from: 'countries.id',
          to: 'cities.country_id',
        },
      },
    };
  }
}

export default Country;
