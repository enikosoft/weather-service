import {Knex} from 'knex';

export async function seed(knex: Knex) {
  await knex('cities').del();

  return knex('countries')
    .del()
    .then(async () => {
      const mock_countries = require('./../countries-cities');

      const capitals = [];
      const countries = mock_countries.map(({name, region, iso3, cities}, index) => {
        const capital = cities[0]; // cities include only capital for now

        if (capital) {
          capitals.push({
            country_id: index + 1,
            name: capital.name || '',
            is_capital: true,
            countryCode: capital.countryCode || '',
            latitude: capital.latitude || undefined,
            longitude: capital.longitude || undefined,
          });
        }

        return {
          id: index + 1,
          name,
          region,
          iso3,
        };
      });

      await knex('countries').insert(countries);
      await knex('cities').insert(capitals);

      return;
    });
}
