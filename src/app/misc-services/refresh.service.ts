import { Injectable } from '@angular/core';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationService } from 'app/misc-services/location.service';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { fromEvent, interval, merge, Observable, of } from 'rxjs';
import {
  filter,
  mapTo,
  startWith,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs/operators';
import { convertTime } from '@s-libs/js-core';
import { cache } from '@s-libs/rxjs-core';

export const refreshMillis = convertTime(30, 'min', 'ms');

@Injectable({ providedIn: 'root' })
export class RefreshService {
  refresh$: Observable<unknown>;

  constructor(
    private browserService: BrowserService,
    private eventTrackingService: EventTrackingService,
    private locationService: LocationService,
  ) {
    this.refresh$ = this.buildRefresh$();
  }

  private buildRefresh$(): Observable<unknown> {
    const interval$ = interval(refreshMillis).pipe(mapTo('interval_refresh'));
    const focus$ = fromEvent(window, 'focus').pipe(mapTo('focus_refresh'));
    return this.locationService.refreshableChange$.pipe(
      startWith(undefined),
      switchMap((source1) =>
        merge(of(source1), focus$).pipe(
          switchMap((source2) => merge(of(source2), interval$)),
          filter(() => this.browserService.hasFocus()),
          throttleTime(refreshMillis),
        ),
      ),
      tap((source) => {
        if (source) {
          this.eventTrackingService.track(source, 'refresh');
        }
      }),
      switchMap(() => this.locationService.refresh()),
      cache(),
    );
  }
}
