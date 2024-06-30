import { inject } from '@angular/core';
import { assert } from '@s-libs/js-core';
import { InjectableSuperclass } from '@s-libs/ng-core';
import { Store } from '@s-libs/signal-store';
import { LocationService } from 'app/misc-services/location.service';
import { RefreshService } from 'app/misc-services/refresh.service';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { Source, SourceId } from 'app/state/source';
import { WeatherStore } from 'app/state/weather-store';
import { observeStore } from 'app/to-replace/signal-store/observe-store';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { NEVER, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const notAvailableHere = Symbol();

export abstract class AbstractSource extends InjectableSuperclass {
  #errorService = inject(SnackBarErrorService);
  #locationService = inject(LocationService);
  #refreshService = inject(RefreshService);
  #show$: Observable<boolean>;

  private store = inject(WeatherStore);
  private sourceStore: Store<Source>;

  constructor(key: SourceId) {
    super();
    this.sourceStore = this.store('sources')(key);
    this.#show$ = observeStore(this.sourceStore('show'));
  }

  initialize(fallback?: SourceId): void {
    this.subscribeTo(
      this.#refreshService.refresh$.pipe(
        switchMap(() => this.#show$),
        switchMap((show) => this.#refresh(show, fallback)),
      ),
      this.#setForecast,
    );
  }

  protected abstract fetch(gpsCoords: GpsCoords): Observable<Forecast>;

  #refresh(show: boolean, fallback?: SourceId): Observable<Forecast> {
    if (!show) {
      return NEVER;
    }

    const gpsCoords = this.#locationService.getLocation().gpsCoords;
    assert(gpsCoords, 'should not get here unless location refresh succeeded');
    return this.fetch(gpsCoords).pipe(
      catchError((error) => {
        this.#handleError(error, fallback);
        return NEVER;
      }),
    );
  }

  #handleError(error: any, fallback: SourceId | undefined): void {
    if (error !== notAvailableHere) {
      this.#errorService.handleError(error, { logUnexpected: false });
    } else if (fallback && this.store('allowSourceFallback').state) {
      this.sourceStore('show').state = false;
      this.store('sources')(fallback)('show').state = true;
    } else {
      const label = this.sourceStore('label').state;
      this.#errorService.show(
        `${label} is not available here. Try another source (in the settings).`,
      );
    }
  }

  #setForecast(forecast: Forecast): void {
    this.store('allowSourceFallback').state = false;
    this.sourceStore('forecast').state = forecast;
  }
}
