import { Injectable } from "@angular/core";
import { BrowserService } from "app/services/browser.service";
import { LocationIqService } from "app/services/location-iq.service";
import { GpsCoords, Location } from "app/state/location";
import { WeatherStore } from "app/state/weather-store";
import { combineLatest, Observable, of } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import {
  catchError,
  distinctUntilChanged,
  map,
  skip,
  switchMap,
  tap,
} from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";

@Injectable({ providedIn: "root" })
export class LocationService extends InjectableSuperclass {
  $ = this.store("useCurrentLocation").$.pipe(
    switchMap(
      (useCurrent) =>
        this.store(useCurrent ? "currentLocation" : "customLocation").$,
    ),
  );
  refreshableChange$: Observable<unknown> = combineLatest([
    this.store("customLocation")("search").$,
    this.store("useCurrentLocation").$,
  ]).pipe(
    map(([search, useCurrent]) => searchToActuallyUse(search, useCurrent)),
    distinctUntilChanged(),
    skip(1),
  );

  constructor(
    private browserService: BrowserService,
    private locationIqService: LocationIqService,
    private store: WeatherStore,
  ) {
    super();
  }

  setCustomSearch(search: string) {
    this.store.batch((batch) => {
      batch("useCurrentLocation").set(false);
      batch("customLocation").set({ search, gpsCoords: undefined });
    });
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
        // TODO: test cancelling reverse lookup
        this.locationIqService.reverse(gpsCoords).pipe(
          tap((res) => {
            this.store("currentLocation").assign({ gpsCoords, city: res.city });
          }),
          catchError((err) => {
            console.error(err);
            this.store("currentLocation")("city").delete();
            return of(0);
          }),
        ),
      ),
      catchError((err) => {
        console.error(err);
        this.store("currentLocation").set(new Location());
        return of(0);
      }),
    );
  }

  private refreshCustomLocation(search: string) {
    return this.locationIqService.forward(search).pipe(
      tap((partialLocation) => {
        this.store("customLocation").assign(partialLocation);
      }),
    );
  }
}

function searchToActuallyUse(search: string, useCurrent: boolean) {
  return useCurrent ? "" : search;
}
