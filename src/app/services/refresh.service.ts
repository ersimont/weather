import { Injectable } from "@angular/core";
import { ErrorService } from "app/services/error.service";
import { LocationService } from "app/services/location.service";
import { WeatherStore } from "app/state/weather-store";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { fromEvent, interval, merge, Observable, of } from "rxjs";
import { filter, mapTo, switchMap, tap, throttleTime } from "rxjs/operators";
import { cache } from "s-rxjs-utils";

export const refreshPeriod = 30 * 60 * 1000;

@Injectable({ providedIn: "root" })
export class RefreshService {
  refresh$: Observable<unknown>;

  constructor(
    private errorService: ErrorService,
    private eventTrackingService: EventTrackingService,
    private locationService: LocationService,
    private store: WeatherStore,
  ) {
    this.refresh$ = this.buildRefresh$();
  }

  private buildRefresh$() {
    const init$ = of("init_refresh");
    const location$ = this.locationService.refreshableChange$.pipe(
      mapTo("location_change_refresh"),
    );
    const interval$ = interval(refreshPeriod).pipe(mapTo("interval_refresh"));
    const focus$ = fromEvent(window, "focus").pipe(mapTo("focus_refresh"));

    return merge(init$, location$).pipe(
      switchMap((source) =>
        merge(of(source), interval$, focus$).pipe(
          filter(() => document.hasFocus()),
          throttleTime(refreshPeriod),
        ),
      ),
      tap(this.logRefresh.bind(this)),
      this.locationService.refreshInPipe(),
      filter(() => {
        if (this.locationService.getLocation().gpsCoords) {
          return true;
        }

        this.errorService.show("Location not found");
        this.store.dispatch({ type: "ask_for_location" });
        return false;
      }),
      cache(),
    );
  }

  private logRefresh(source: string) {
    this.eventTrackingService.track(source, "refresh");
  }
}
