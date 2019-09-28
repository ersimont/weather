import { Injectable } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { fromEvent, interval, merge, Observable, of } from "rxjs";
import { filter, mapTo, switchMap, tap, throttleTime } from "rxjs/operators";
import { cache } from "s-rxjs-utils";

export const refreshPeriod = 30 * 60 * 1000;

@Injectable({ providedIn: "root" })
export class RefreshService {
  refresh$: Observable<unknown>;

  constructor(
    private eventTrackingService: EventTrackingService,
    private locationService: LocationService,
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
      cache(),
    );
  }

  private logRefresh(source: string) {
    this.eventTrackingService.track(source, "refresh");
  }
}
