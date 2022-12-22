import {BadRequest, InternalServerError, NotFound} from '@exceptions/errors';
import {CitiesRepository} from '@components/cities';
import {NextFunction, Request, Response} from 'express';

const checkCityMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const cityRepository = CitiesRepository.getInstance();

    const id = req.params?.id;

    if (!id) {
      return next(new BadRequest('City Id is required.'));
    }

    if (isNaN(Number(id))) {
      return next(new BadRequest(`ID must be a number.`));
    }

    const city = await cityRepository.getCityById(Number(id));

    if (!city) {
      return next(new NotFound(`City with id - ${id} not found.`));
    }

    next();
  } catch (error) {
    console.log(error);
    next(new InternalServerError('Something went wrong.'));
  }
};

export default checkCityMiddleware;
