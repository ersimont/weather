import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationIqService } from 'app/misc-services/location-iq.service';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { isEqual, mapValues } from 'micro-dash';
import { StoreObject } from 'ng-app-state';
import { NEVER, of, Subject } from 'rxjs';
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
    switchMap((useCurrent) => this.getLocationStore(useCurrent).$),
  );
  refreshableChange$ = this.store.$.pipe(
    map((state) => [state.useCurrentLocation, state.customLocation.search]),
    distinctUntilChanged(isEqual),
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
      clearForecasts(batch);
      batch('useCurrentLocation').set(value);
      if (value) {
        batch('currentLocation')('city').delete();
      }
    });
  }

  setCustomSearch(search: string) {
    this.store.batch((batch) => {
      clearForecasts(batch);
      batch('useCurrentLocation').set(false);
      batch('customLocation').set({ search, gpsCoords: undefined });
    });
    this.eventTrackingService.track('change_custom_search', 'change_location');
  }

  getLocation() {
    return this.getLocationStore(this.store.state().useCurrentLocation).state();
  }

  refresh() {
    const state = this.store.state();
    if (state.useCurrentLocation) {
      return this.refreshCurrentLocation();
    } else if (state.customLocation.gpsCoords) {
      return of(0);
    } else if (state.customLocation.search) {
      return this.refreshCustomLocation();
    } else {
      return NEVER;
    }
  }

  private getLocationStore(useCurrent: boolean) {
    return this.store(useCurrent ? 'currentLocation' : 'customLocation');
  }

  private refreshCurrentLocation() {
    return fromPromise(this.browserService.getCurrentLocation()).pipe(
      switchMap((gpsCoords: GpsCoords) =>
        this.locationIqService.reverse(gpsCoords).pipe(
          tap((res) => {
            this.store('currentLocation').assign({ gpsCoords, city: res.city });
          }),
        ),
      ),
      catchError((error) => {
        this.store('currentLocation')('city').delete();
        this.handleNotFound(error);
        return NEVER;
      }),
    );
  }

  private refreshCustomLocation() {
    const search = this.store.state().customLocation.search;
    return this.locationIqService.forward(search).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.handleNotFound(error);
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

  private handleNotFound(error: any) {
    console.error(error);
    this.errorService.show('Location not found');
    this.askForLocation$.next();
  }
}

function clearForecasts(batch: StoreObject<WeatherState>) {
  batch('sources').setUsing((sources) =>
    mapValues(sources, (source) => ({ ...source, forecast: {} })),
  );
}
