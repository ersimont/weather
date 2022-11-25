import { Forecast } from './forecast';

export enum SourceId {
  OPEN_WEATHER = 'openWeather',
  VISUAL_CROSSING = 'visualCrossing',
  WEATHER_GOV = 'weatherGov',
  WEATHER_UNLOCKED = 'weatherUnlocked',
}

export class Source {
  forecast: Forecast = {};

  constructor(public label: string, public show: boolean) {}
}
