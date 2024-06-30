import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { assert } from '@s-libs/js-core';
import { isEqual, mapValues, omit } from '@s-libs/micro-dash';
import { InjectableSuperclass } from '@s-libs/ng-core';
import { Store } from '@s-libs/signal-store';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationIqService } from 'app/misc-services/location-iq.service';
import { GpsCoords, Location } from 'app/state/location';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { observeStore } from 'app/to-replace/signal-store/observe-store';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { from, NEVER, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LocationService extends InjectableSuperclass {
  #browserService = inject(BrowserService);
  #errorService = inject(SnackBarErrorService);
  #eventTrackingService = inject(EventTrackingService);
  #locationIqService = inject(LocationIqService);
  private store = inject(WeatherStore);

  $ = this.#buildObservable();
  refreshableChange$ = observeStore(this.store).pipe(
    map((state) => [state.useCurrentLocation, state.customLocation.search]),
    distinctUntilChanged(isEqual),
    skip(1),
    map(() => undefined),
  );
  askForLocation$ = new Subject<void>();

  setUseCurrentLocation(value: boolean): void {
    this.#clearForecasts();
    this.store('useCurrentLocation').state = value;
    if (value) {
      this.store('currentLocation').update(omit, 'city' as const);
    }
  }

  setCustomSearch(search: string): void {
    this.#clearForecasts();
    this.store('useCurrentLocation').state = false;
    this.store('customLocation').state = new Location(search);
    this.#eventTrackingService.track('change_custom_search', 'change_location');
  }

  getLocation(): Location {
    return this.#getLocationStore(this.store('useCurrentLocation').state).state;
  }

  refresh(): Observable<unknown> {
    const { state } = this.store;
    if (state.useCurrentLocation) {
      return this.#refreshCurrentLocation();
    } else if (state.customLocation.timezone) {
      return of(0);
    } else if (state.customLocation.gpsCoords) {
      return this.#refreshTimezone();
    } else if (state.customLocation.search) {
      return this.#refreshCustomLocation();
    } else {
      return NEVER;
    }
  }

  isBlank(): boolean {
    const { state } = this.store;
    return !(state.useCurrentLocation || state.customLocation.search);
  }

  #getLocationStore(useCurrent: boolean): Store<Location> {
    return this.store(useCurrent ? 'currentLocation' : 'customLocation');
  }

  #refreshCurrentLocation(): Observable<unknown> {
    return from(this.#browserService.getCurrentLocation()).pipe(
      switchMap((gpsCoords: GpsCoords) =>
        this.#locationIqService.reverse(gpsCoords).pipe(
          catchError((error) => {
            this.store('currentLocation').update(omit, 'city' as const);
            this.#errorService.handleError(error, { logUnexpected: false });
            return NEVER;
          }),
          tap((res) => {
            this.store('currentLocation').assign({ gpsCoords, city: res.city });
          }),
        ),
      ),
      catchError((error) => {
        this.store('currentLocation').update(omit, 'city' as const);
        this.#handleNotFound(error);
        return NEVER;
      }),
    );
  }

  #refreshCustomLocation(): Observable<string> {
    const search = this.store('customLocation')('search').state;
    return this.#locationIqService.forward(search).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.#handleNotFound(error);
        } else {
          this.#errorService.handleError(error, { logUnexpected: false });
        }
        return NEVER;
      }),
      tap((locationPatch) => {
        this.store('customLocation').assign(locationPatch);
      }),
      switchMap(() => this.#refreshTimezone()),
    );
  }

  #refreshTimezone(): Observable<string> {
    const gpsCoords = this.store('customLocation')('gpsCoords').state;
    assert(gpsCoords, 'should have gps before timezone');
    return this.#locationIqService.timezone(gpsCoords).pipe(
      catchError((error) => {
        this.#errorService.handleError(error, { logUnexpected: false });
        return NEVER;
      }),
      tap((timezone) => {
        this.store('customLocation')('timezone').state = timezone;
      }),
    );
  }

  #handleNotFound(error: any): void {
    console.error(error);
    this.#errorService.show('Location not found');
    this.askForLocation$.next();
  }

  #clearForecasts(): void {
    this.store('sources').update((sources) =>
      mapValues(sources, (source) => ({ ...source, forecast: {} })),
    );
  }

  #buildObservable(): Observable<Location> {
    const current$ = observeStore(this.store('currentLocation'));
    const custom$ = observeStore(this.store('customLocation'));
    return observeStore(this.store('useCurrentLocation')).pipe(
      switchMap((useCurrent) => (useCurrent ? current$ : custom$)),
    );
  }
}
