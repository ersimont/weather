import { Injectable } from "@angular/core";
import { fromEvent, interval, merge } from "rxjs";
import { filter, startWith, throttleTime } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";
import { getCurrentGpsCoords } from "./gps-coords.service";
import { WeatherGov } from "./sources/weather-gov";
import { WeatherUnlocked } from "./sources/weather-unlocked";
import { WeatherStore } from "./state/weather-store";

@Injectable({ providedIn: "root" })
export class RefreshService extends InjectableSuperclass {
  private initialized = false;

  constructor(
    private store: WeatherStore,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
  ) {
    super();
  }

  async start() {
    const period = 30 * 60 * 1000;
    const refresh$ = merge(
      interval(period).pipe(
        startWith(),
        filter(() => document.hasFocus()),
      ),
      fromEvent(window, "focus"),
    ).pipe(throttleTime(period));
    this.subscribeTo(refresh$, this.refresh);
  }

  private async refresh() {
    this.store("gpsCoords").set(await getCurrentGpsCoords());
    if (!this.initialized) {
      this.weatherGov.initialize();
      this.weatherUnlocked.initialize();
      this.initialized = true;
    }
  }
}
