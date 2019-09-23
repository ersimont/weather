import { Injectable } from "@angular/core";
import { fromEvent, merge, Subject, timer } from "rxjs";
import { filter, switchMapTo, throttleTime } from "rxjs/operators";
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
    const auto$ = merge(timer(0, period), fromEvent(window, "focus")).pipe(
      filter(() => document.hasFocus()),
      throttleTime(period),
    );
    const refresh$ = merge(
      this.manualRefresh$,
      this.store("useCurrentLocation").$,
    ).pipe(switchMapTo(auto$));
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
