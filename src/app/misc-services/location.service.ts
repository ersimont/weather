import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationIqService } from 'app/misc-services/location-iq.service';
import { GpsCoords, Location } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { mapValues } from 'micro-dash';
import { StoreObject } from 'ng-app-state';
import { combineLatest, NEVER, Observable, of, Subject } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  catchError,
  distinctUntilChanged,
  map,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import { InjectableSuperclass } from 's-ng-utils';

@Injectable({ providedIn: 'root' })
export class LocationService extends InjectableSuperclass {
  $ = this.store('useCurrentLocation').$.pipe(
    switchMap(
      (useCurrent) =>
        this.store(useCurrent ? 'currentLocation' : 'customLocation').$,
    ),
  );
  refreshableChange$: Observable<unknown> = combineLatest([
    this.store('customLocation')('search').$,
    this.store('useCurrentLocation').$,
  ]).pipe(
    map(([search, useCurrent]) => searchToActuallyUse(search, useCurrent)),
    distinctUntilChanged(),
    skip(1),
  );
  askForLocation$ = new Subject<void>();

  constructor(
    private browserService: BrowserService,
    private errorService: SnackBarErrorService,
    private eventTrackingService: EventTrackingService,
    private locationIqService: LocationIqService,
    private store: WeatherStore,
  ) {
    super();
  }

  setUseCurrentLocation(value: boolean) {
    this.store.batch((batch) => {
      batch('useCurrentLocation').set(value);
      clearForecasts(batch);
    });
  }

  setCustomSearch(search: string) {
    this.store.batch((batch) => {
      batch('useCurrentLocation').set(false);
      batch('customLocation').set({ search, gpsCoords: undefined });
      clearForecasts(batch);
    });
    this.eventTrackingService.track('change_custom_search', 'change_location');
  }

  getLocation() {
    const state = this.store.state();
    return state.useCurrentLocation
      ? state.currentLocation
      : state.customLocation;
  }

  refresh() {
    const state = this.store.state();
    const search = searchToActuallyUse(
      state.customLocation.search,
      state.useCurrentLocation,
    );
    if (!search) {
      return this.refreshCurrentLocation();
    } else if (state.customLocation.gpsCoords) {
      return of(0);
    } else {
      return this.refreshCustomLocation(search);
    }
  }

  private refreshCurrentLocation() {
    return fromPromise(this.browserService.getCurrentLocation()).pipe(
      switchMap((gpsCoords: GpsCoords) =>
        this.locationIqService.reverse(gpsCoords).pipe(
          tap((res) => {
            this.store('currentLocation').assign({ gpsCoords, city: res.city });
          }),
          catchError((err) => {
            console.error(err);
            this.store('currentLocation')('city').delete();
            return of(0);
          }),
        ),
      ),
      catchError((err) => {
        console.error(err);
        this.store('currentLocation').set(new Location());
        return of(0);
      }),
    );
  }

  private refreshCustomLocation(search: string) {
    return this.locationIqService.forward(search).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.errorService.show(
            'Location not found. Please try a different search.',
          );
        } else {
          this.errorService.handleError(error, { logUnexpected: false });
        }
        return NEVER;
      }),
      tap((partialLocation) => {
        this.store('customLocation').assign(partialLocation);
      }),
    );
  }
}

function searchToActuallyUse(search: string, useCurrent: boolean) {
  return useCurrent ? '' : search;
}

function clearForecasts(batch: StoreObject<WeatherState>) {
  batch('sources').setUsing((sources) =>
    mapValues(sources, (source) => ({ ...source, forecast: {} })),
  );
}
