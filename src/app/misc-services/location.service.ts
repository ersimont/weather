import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { assert } from '@s-libs/js-core';
import { isEqual, mapValues } from '@s-libs/micro-dash';
import { InjectableSuperclass } from '@s-libs/ng-core';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationIqService } from 'app/misc-services/location-iq.service';
import { GpsCoords, Location } from 'app/state/location';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { NEVER, of, Subject } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  catchError,
  distinctUntilChanged,
  map,
  mapTo,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LocationService extends InjectableSuperclass {
  $ = this.store('useCurrentLocation').$.pipe(
    switchMap((useCurrent) => this.getLocationStore(useCurrent).$),
  );
  refreshableChange$ = this.store.$.pipe(
    map((state) => [state.useCurrentLocation, state.customLocation.search]),
    distinctUntilChanged(isEqual),
    skip(1),
    mapTo(undefined),
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
    this.store.batch(() => {
      this.clearForecasts();
      this.store('useCurrentLocation').set(value);
      if (value) {
        this.store('currentLocation')('city').delete();
      }
    });
  }

  setCustomSearch(search: string) {
    this.store.batch(() => {
      this.clearForecasts();
      this.store('useCurrentLocation').set(false);
      this.store('customLocation').set(new Location(search));
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
    } else if (state.customLocation.timezone) {
      return of(0);
    } else if (state.customLocation.gpsCoords) {
      return this.refreshTimezone();
    } else if (state.customLocation.search) {
      return this.refreshCustomLocation();
    } else {
      return NEVER;
    }
  }

  isBlank() {
    const state = this.store.state();
    return !(state.useCurrentLocation || state.customLocation.search);
  }

  private getLocationStore(useCurrent: boolean) {
    return this.store(useCurrent ? 'currentLocation' : 'customLocation');
  }

  private refreshCurrentLocation() {
    return fromPromise(this.browserService.getCurrentLocation()).pipe(
      switchMap((gpsCoords: GpsCoords) =>
        this.locationIqService.reverse(gpsCoords).pipe(
          catchError((error) => {
            this.store('currentLocation')('city').delete();
            this.errorService.handleError(error, { logUnexpected: false });
            return NEVER;
          }),
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
      switchMap(() => this.refreshTimezone()),
    );
  }

  private refreshTimezone() {
    const gpsCoords = this.store.state().customLocation.gpsCoords;
    assert(gpsCoords, 'should have gps before timezone');
    return this.locationIqService.timezone(gpsCoords).pipe(
      catchError((error) => {
        this.errorService.handleError(error, { logUnexpected: false });
        return NEVER;
      }),
      tap((timezone) => {
        this.store('customLocation')('timezone').set(timezone);
      }),
    );
  }

  private handleNotFound(error: any) {
    console.error(error);
    this.errorService.show('Location not found');
    this.askForLocation$.next();
  }

  private clearForecasts() {
    this.store('sources').setUsing((sources) =>
      mapValues(sources, (source) => ({ ...source, forecast: {} })),
    );
  }
}
