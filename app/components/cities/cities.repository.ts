import {InternalServerError} from './../../exceptions/errors';
import {Country, CountryRegions} from './../countries';
import CityModel, {CityQueryLogModel} from './city.model';
import City, {CityRequestType} from './city.type';

export class CitiesRepository {
  private static instance: CitiesRepository;

  /**
   * Singletone pattern
   */
  static getInstance(): CitiesRepository {
    if (!CitiesRepository.instance) {
      CitiesRepository.instance = new CitiesRepository();
    }

    return CitiesRepository.instance;
  }

  /**
   * Service for getting only capitals by country region
   * For now available only Europe capitals
   *
   * param countryRegion optional. Service returns all capitals without it.
   */
  async getAvailableCities(capitals: boolean, countryRegion?: CountryRegions): Promise<City[]> {
    try {
      const conditional = {...(countryRegion ? {region: countryRegion} : {})};

      const result = await Country.query()
        .where(conditional)
        .joinRelated('cities', {alias: 'city'})
        .modify(function (queryBuilder) {
          if (capitals) {
            queryBuilder.where('city.is_capital', capitals);
          }
        })
        .select('city.id', 'city.name', 'city.countryCode');

      if (!result) {
        return [];
      }

      return result.filter(Boolean).map((c) => c.toJSON() as City);
    } catch (e) {
      throw new Error(`Cities Service error: ${e.message}`);
    }
  }

  async getCityById(id: number): Promise<City> {
    const city = await CityModel.query().findById(id);

    if (!city) return undefined;

    return city as City;
  }

  // tslint:disable-next-line: no-any // json
  async logAfterCitiesQuery(id: number, type: CityRequestType, attributes = {}): Promise<number> {
    try {
      await CityQueryLogModel.query().insert({
        city_id: id,
        type,
        attributes: JSON.stringify({}),
      });

      return id;
    } catch (e) {
      throw new InternalServerError(e.message);
    }
  }
}
