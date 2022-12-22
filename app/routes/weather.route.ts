import {WeatherController} from '@components/weather';
import {Router} from 'express';
import {Routes} from './routes.interface';
import checkCityMiddleware from '@app/middlewares/city.middleware';

class WeatherRoute implements Routes {
  path = '/weather';
  router = Router();
  weatherController = new WeatherController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(`${this.path}/cities/:id/daily`, checkCityMiddleware, this.weatherController.getWeatherForCity);
    this.router.get(
      `${this.path}/cities/:id/timeline`,
      checkCityMiddleware,
      this.weatherController.getTimelineWeatherForCity,
    );

    this.router.get(
      `${this.path}/cities/:id/averageTemperature`,
      checkCityMiddleware,
      this.weatherController.getAverageWeatherInCity,
    );

    this.router.get(`${this.path}/mostRequestedCity`, this.weatherController.getMostRequestedCity);
  }
}

export default WeatherRoute;
