import { GpsCoords } from "../gps-coords.service";

export interface Forecast {
  city: string;
  [timestamp: number]: Conditions;
}

export interface Conditions {
  temperature?: number;
  apparentTemperature?: number;
  dewPoint?: number;
  windSpeed?: number;
  chanceOfPrecipitation?: number;
  amountOfPrecipitation?: number;
}

export abstract class AbstractClient {
  abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
