export default interface City {
  id: number;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export enum CityRequestType {
  GET_CITY_WEATHER = 'GET_CITY_WEATHER',
  GET_CITY = 'GET_CITY',
  UPDATE_CITY = 'UPDATE_CITY',
  DELETE_CITY = 'DELETE_CITY',
}
