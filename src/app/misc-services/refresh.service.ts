import { inject, Service } from '@angular/core';
import { environment } from '@env';
import { cache, isPageVisible$ } from '@s-libs/rxjs-core';
import { LocationService } from 'app/misc-services/location.service';
import { MixpanelService } from 'app/to-replace/mixpanel-core/mixpanel.service';
import {
  filter,
  interval,
  map,
  Observable,
  skip,
  startWith,
  switchMap,
  throttleTime,
} from 'rxjs';

@Service()
export class RefreshService {
  refresh$: Observable<unknown>;

  #eventTrackingService = inject(MixpanelService);
  #locationService = inject(LocationService);

  constructor() {
    this.refresh$ = this.#buildRefresh$();
  }

  #buildRefresh$(): Observable<unknown> {
    const focus$ = isPageVisible$().pipe(skip(1), startWith(undefined));
    const interval$ = interval(environment.refreshMillis).pipe(
      map(() => 'interval_refresh'),
      startWith('focus_refresh'),
    );
    return this.#locationService.refreshableChange$.pipe(
      startWith(undefined),
      switchMap(() =>
        focus$.pipe(
          switchMap(() => interval$),
          filter(() => document.visibilityState === 'visible'),
          throttleTime(environment.refreshMillis * 0.9),
        ),
      ),
      switchMap((source) => {
        if (source) {
          this.#eventTrackingService.track(source, { category: 'refresh' });
        }
        return this.#locationService.refresh();
      }),
      cache(),
    );
  }
}
