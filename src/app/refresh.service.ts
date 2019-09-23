import { Injectable } from "@angular/core";
import { fromEvent, merge, Observable, Subject, timer } from "rxjs";
import { filter, switchMap, switchMapTo, throttleTime } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";
import { LocationService } from "./location.service";
import { WeatherStore } from "./state/weather-store";

@Injectable({ providedIn: "root" })
export class RefreshService extends InjectableSuperclass {
  refresh$: Observable<unknown>;

  private manualRefresh$ = new Subject();

  constructor(
    private locationService: LocationService,
    private store: WeatherStore,
  ) {
    super();

    const period = 30 * 60 * 1000;
    this.refresh$ = merge(
      this.manualRefresh$,
      this.store("useCurrentLocation").$,
    ).pipe(
      switchMapTo(
        merge(timer(0, period), fromEvent(window, "focus")).pipe(
          filter(() => document.hasFocus()),
          throttleTime(period),
        ),
      ),
      switchMap(() => this.locationService.refresh()),
    );
  }

  refresh() {
    this.manualRefresh$.next();
  }
}
