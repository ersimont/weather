import { Injectable } from "@angular/core";
import { fromEvent, interval, merge, of, Subject } from "rxjs";
import { filter, switchMap, throttleTime } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";
import { LocationService } from "./location.service";
import { WeatherGov } from "./sources/weather-gov";
import { WeatherUnlocked } from "./sources/weather-unlocked";
import { WeatherStore } from "./state/weather-store";

@Injectable({ providedIn: "root" })
export class RefreshService extends InjectableSuperclass {
  private manualRefresh$ = new Subject();

  constructor(
    private locationService: LocationService,
    private store: WeatherStore,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
  ) {
    super();
  }

  async start() {
    const period = 30 * 60 * 1000;
    const refresh$ = merge(
      this.manualRefresh$,
      this.store("useCurrentLocation").$,
    ).pipe(
      switchMap(() =>
        merge(of(null), interval(period), fromEvent(window, "focus")).pipe(
          filter(() => document.hasFocus()),
          throttleTime(period),
        ),
      ),
    );
    this.subscribeTo(refresh$, this.fetchAll);
  }

  refresh() {
    this.manualRefresh$.next();
  }

  private async fetchAll() {
    await this.locationService.refresh();

    this.weatherGov.refresh();
    this.weatherUnlocked.refresh();
  }
}
