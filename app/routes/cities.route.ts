import {CitiesController} from '@components/cities';
import {Router} from 'express';
import {Routes} from './routes.interface';

class CitiesRoute implements Routes {
  path = '/cities';
  router = Router();
  citiesController = new CitiesController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(`${this.path}`, this.citiesController.getCities);
  }
}

export default CitiesRoute;
