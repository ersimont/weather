import { identity, keyBy, mapValues } from "micro-dash";
import { Condition } from "./condition";
import { Forecast } from "./forecast";

export enum SourceId {
  WEATHER_GOV = "weatherGov",
  WEATHER_UNLOCKED = "weatherUnlocked",
}

export class Source {
  showMetric = mapValues(keyBy(Condition, identity), () => true);
  forecast: Forecast = {};

  constructor(public label: string, public show: boolean) {}
}
