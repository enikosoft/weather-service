import {NextFunction, Response, Request} from 'express';
import {getSuccessResponse} from './../../types/responseType';
import {strToBool} from './../../utils/strToBool';
import {BadRequest, ServiceUnavailable} from './../../exceptions/errors';
import {CountryRegions} from './../countries';
import City from './city.type';
import {CitiesRepository} from './cities.repository';

export class CitiesController {
  citiesRepository: CitiesRepository;

  constructor() {
    this.citiesRepository = CitiesRepository.getInstance();
  }

  getCities = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const availableQueryParams = ['onlyCapitals', 'countryRegion'];

      for (const key of Object.keys(request.query)) {
        if (!availableQueryParams.includes(key)) {
          throw new BadRequest(`Query parameter ${key} is unavailable.`);
        }
      }

      const onlyCapitals = request.query?.onlyCapitals;
      const countryRegion = request.query?.countryRegion as CountryRegions;

      if (countryRegion && !Object.values(CountryRegions)?.includes(countryRegion)) {
        throw new BadRequest(`Region ${countryRegion} is unavailable.`);
      }

      if (!onlyCapitals) {
        throw new ServiceUnavailable('For now request is available only with capitals flag. Use `onlyCapitals=true`.');
      }

      const capitalsFlag = strToBool(onlyCapitals.toString());
      const cities = await this.citiesRepository.getAvailableCities(capitalsFlag, countryRegion);

      const res = getSuccessResponse<City[]>(cities, 200);
      response.status(200).json(res);
    } catch (error) {
      next(error);
    }
  };
}
