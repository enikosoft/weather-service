import {EventSubscriber, On} from 'event-dispatch';

import {CitiesRepository, CityRequestType} from './../components/cities';
import {events} from '.';

@EventSubscriber()
export class CitiesEventSubscriber {
  private citiesService: CitiesRepository;
  constructor() {
    this.citiesService = new CitiesRepository();
  }

  @On(events.city.getWeather)
  async getWeather(cityId: number) {
    if (Number(cityId)) {
      await this.citiesService.logAfterCitiesQuery(cityId, CityRequestType.GET_CITY_WEATHER);
    }
  }
}
