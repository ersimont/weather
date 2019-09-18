import { Forecast } from "./forecast";

export enum SourceId {
  WEATHER_GOV = "weatherGov",
  WEATHER_UNLOCKED = "weatherUnlocked",
}

export class Source {
  forecast: Forecast = {};

  constructor(public label: string, public show: boolean) {}
}
