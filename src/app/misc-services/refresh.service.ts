import { inject, Injectable } from '@angular/core';
import { convertTime } from '@s-libs/js-core';
import { cache, isPageVisible$ } from '@s-libs/rxjs-core';
import { LocationService } from 'app/misc-services/location.service';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { interval, Observable } from 'rxjs';
import {
  filter,
  map,
  skip,
  startWith,
  switchMap,
  throttleTime,
} from 'rxjs/operators';

export const refreshMillis = convertTime(30, 'min', 'ms');

@Injectable({ providedIn: 'root' })
export class RefreshService {
  refresh$: Observable<unknown>;

  #eventTrackingService = inject(EventTrackingService);
  #locationService = inject(LocationService);

  constructor() {
    this.refresh$ = this.#buildRefresh$();
  }

  #buildRefresh$(): Observable<unknown> {
    const focus$ = isPageVisible$().pipe(skip(1), startWith(undefined));
    const interval$ = interval(refreshMillis).pipe(
      map(() => 'interval_refresh'),
      startWith('focus_refresh'),
    );
    return this.#locationService.refreshableChange$.pipe(
      startWith(undefined),
      switchMap(() =>
        focus$.pipe(
          switchMap(() => interval$),
          filter(() => document.visibilityState === 'visible'),
          throttleTime(refreshMillis),
        ),
      ),
      switchMap((source) => {
        if (source) {
          this.#eventTrackingService.track(source, 'refresh');
        }
        return this.#locationService.refresh();
      }),
      cache(),
    );
  }
}
