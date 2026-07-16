import { Forecast } from './forecast';

export enum SourceId {
  OPEN_MATEO = 'openMateo',
  OPEN_WEATHER = 'openWeather',
  VISUAL_CROSSING = 'visualCrossing',
  WEATHER_GOV = 'weatherGov',
}

export class Source {
  forecast: Forecast = {};

  constructor(
    public label: string,
    public show: boolean,
  ) {}
}
