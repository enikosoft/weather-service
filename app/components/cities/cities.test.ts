import request from 'supertest';
import Knex from 'knex';

import App from './../../app';
import {BadRequest, ServiceUnavailable} from '@exceptions/errors';
import {config} from '@app/config/knex';
import CitiesRoute from '@routes/cities.route';
import {updateWeather} from '@app/loaders/crons';
import {getErrorResponse} from '@app/types/responseType';

afterAll(async () => {
  // tslint:disable-next-line: no-unnecessary-callback-wrapper
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

// stop cron
beforeAll(async () => {
  await updateWeather.stop();
});

describe('Testing Cities Request', () => {
  describe('[GET] /cities', () => {
    const usersRoute = new CitiesRoute();
    const app = new App([usersRoute]);

    it('response with status [200] with correct query params', () => {
      return request(app.getServer()).get(`${usersRoute.path}?onlyCapitals=true&countryRegion=Europe`).expect(200);
    });

    it('response with status [400] if request includes incorrect query params', async () => {
      const response = await request(app.getServer()).get(`${usersRoute.path}?wrongParams=true`);
      const errorResponse = getErrorResponse(new BadRequest('Query parameter wrongParams is unavailable.'));
      expect(response.status).toEqual(400);
      expect(response.body).toEqual(errorResponse);

      return;
    });

    it('response with status [400] if region is unavailable', async () => {
      const response = await request(app.getServer()).get(`${usersRoute.path}?onlyCapitals=true&countryRegion=Afrika`);
      const errorResponse = getErrorResponse(new BadRequest(`Region Afrika is unavailable.`));
      expect(response.status).toEqual(400);
      expect(response.body).toEqual(errorResponse);

      return;
    });

    it('response with status [503] if onlyCapitals query params not specified', async () => {
      const response = await request(app.getServer()).get(`${usersRoute.path}`);
      const errorResponse = getErrorResponse(
        new ServiceUnavailable('For now request is available only with capitals flag. Use `onlyCapitals=true`.'),
      );
      expect(response.status).toEqual(503);
      expect(response.body).toEqual(errorResponse);

      return;
    });

    it('response with status [200] and right count of country capitals in Europe', async () => {
      const knex = Knex(config.development);

      const result = await knex.raw(`
        SELECT COUNT(city.*) FROM countries country
        LEFT JOIN cities city ON city.country_id = country.id
        WHERE city.is_capital = TRUE
      `);

      const countryCount = Number(result.rows[0].count);

      const response = await request(app.getServer()).get(`${usersRoute.path}?onlyCapitals=true&countryRegion=Europe`);

      expect(response.status).toEqual(200);

      expect(countryCount).toEqual(response.body.data.length);

      return;
    });
  });
});
