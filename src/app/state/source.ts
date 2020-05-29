import { Forecast } from './forecast';

export enum SourceId {
  CLIMACELL = 'climacell',
  OPEN_WEATHER = 'openWeather',
  WEATHER_GOV = 'weatherGov',
  WEATHER_UNLOCKED = 'weatherUnlocked',
}

export class Source {
  forecast: Forecast = {};

  constructor(public label: string, public show: boolean) {}
}
