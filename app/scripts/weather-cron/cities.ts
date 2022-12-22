import {Country} from './../../components/countries';
import {City} from '@components/cities';
import moment from 'moment';

/*
 * Get city names for request to weather API
 */
export const getCitiesForJob = async () => {
  try {
    const result = await Country.query()
      .where({region: 'Europe'})
      .joinRelated('cities', {alias: 'city'})
      .where('city.is_capital', true)
      .select('city.id', 'city.name', 'city.countryCode');

    if (!result) {
      return [];
    }

    return result.filter(Boolean).map((c) => c.toJSON() as City);
  } catch (e) {
    console.error(e);
  }
};
