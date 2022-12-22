export interface WeatherAttributes {
  temperature: number;
  visibility: number;
  windSeed: number;
  datetime: Date;
  cloudcover: number;
  precipitation: number;
  seaLevelPressure: number;
  snow: number;
  dewPoint: number;
  windGust: number;
  relativeHumidity: number;
  windDirection: number;
}

export interface WeatherDailyLog extends WeatherAttributes {
  id: number;
  city_id: number;
  sunrise: Date;
  sunset: Date;
  moonphase: number;
  maxTemperature: number;
  minTemperature: number;

  avg?: number; // average temperature
}

export interface WeatherHourlyLog extends WeatherAttributes {
  id: number;
  city_id: number;
  datetimeEpoch: number;
  feelslike: number;
}

export enum SearchPeriod {
  Yesterday = 'yesterday',
  Today = 'today',
  TwoDaysAgo = '2daysAgo',
}

export enum SearchType {
  Period,
  ExactDate,
  DateBetween,
}

export interface AvgTemperatureResponse {
  avgerageTemperature: number;
  startDate?: string;
  endDate?: string;
}
