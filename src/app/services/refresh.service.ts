import { Injectable } from "@angular/core";
import { BrowserService } from "app/services/browser.service";
import { LocationService } from "app/services/location.service";
import { ErrorService } from "app/to-replace/error.service";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { fromEvent, interval, merge, Observable, of } from "rxjs";
import { filter, mapTo, switchMap, tap, throttleTime } from "rxjs/operators";
import { convertTime } from "s-js-utils";
import { cache } from "s-rxjs-utils";

export const refreshMillis = convertTime(30, "min", "ms");

@Injectable({ providedIn: "root" })
export class RefreshService {
  refresh$: Observable<unknown>;

  constructor(
    private browserService: BrowserService,
    private errorService: ErrorService,
    private eventTrackingService: EventTrackingService,
    private locationService: LocationService,
  ) {
    this.refresh$ = this.buildRefresh$();
  }

  private buildRefresh$() {
    return this.buildSource$().pipe(
      switchMap(() => this.locationService.refresh()),
      filter(() => {
        if (this.locationService.getLocation().gpsCoords) {
          return true;
        }

        this.errorService.show("Location not found");
        this.locationService.askForLocation$.next();
        return false;
      }),
      cache(),
    );
  }

  private buildSource$() {
    const init$ = of("init_refresh");
    const location$ = this.locationService.refreshableChange$.pipe(
      mapTo("location_change_refresh"),
    );
    const interval$ = interval(refreshMillis).pipe(mapTo("interval_refresh"));
    const focus$ = fromEvent(window, "focus").pipe(mapTo("focus_refresh"));

    return merge(init$, location$).pipe(
      switchMap((source) =>
        merge(of(source), interval$, focus$).pipe(
          filter(() => this.browserService.hasFocus()),
          throttleTime(refreshMillis),
        ),
      ),
      tap((source) => {
        this.eventTrackingService.track(source, "refresh");
      }),
    );
  }
}
