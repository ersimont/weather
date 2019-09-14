import { GpsCoords, GpsCoordsService } from "../gps-coords.service";
import { Observable } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";
import { Injector } from "@angular/core";

export interface Forecast {
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

export abstract class AbstractSource {
  forecast$: Observable<Forecast>;

  constructor(injector: Injector) {
    this.forecast$ = injector.get(GpsCoordsService).$.pipe(
      switchMap(this.fetch.bind(this)),
      startWith({}),
    );
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
