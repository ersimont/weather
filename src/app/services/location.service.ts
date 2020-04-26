import { Injectable } from "@angular/core";
import { BrowserService } from "app/services/browser.service";
import { LocationIqService } from "app/services/location-iq.service";
import { GpsCoords, Location } from "app/state/location";
import { WeatherStore } from "app/state/weather-store";
import { bindKey } from "micro-dash";
import { merge, Observable, of } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { catchError, filter, skip, switchMap, tap } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";

@Injectable({ providedIn: "root" })
export class LocationService extends InjectableSuperclass {
  $ = this.store("useCurrentLocation").$.pipe(
    switchMap(
      (useCurrent) =>
        this.store(useCurrent ? "currentLocation" : "customLocation").$,
    ),
  );
  refreshableChange$: Observable<unknown> = merge(
    this.store("useCurrentLocation").$.pipe(
      skip(1),
      filter(
        (useCurrent) =>
          useCurrent || !!this.store.state().customLocation.gpsCoords,
      ),
    ),
    this.store("customLocation")("gpsCoords").$.pipe(
      skip(1),
      filter((coords) => !!coords && !this.store.state().useCurrentLocation),
    ),
  );

  constructor(
    private browserService: BrowserService,
    private locationIqService: LocationIqService,
    private store: WeatherStore,
  ) {
    super();
    this.observeSearches();
  }

  setCustomSearch(search: string) {
    this.store.batch((batch) => {
      batch("useCurrentLocation").set(false);
      batch("customLocation").set({ search });
    });
  }

  getLocation() {
    const state = this.store.state();
    return state.useCurrentLocation
      ? state.currentLocation
      : state.customLocation;
  }

  getRefreshOperatorFunction() {
    return switchMap(() => {
      const state = this.store.state();
      if (!state.useCurrentLocation) {
        return of(0);
      }

      return fromPromise(this.browserService.getCurrentLocation()).pipe(
        this.getReverseGpsOperatorFunction(),
        catchError((err) => {
          // TODO: test this keep refreshing
          console.error(err);
          this.store("currentLocation").set(new Location());
          return of(0);
        }),
      );
    });
  }

  private getReverseGpsOperatorFunction() {
    return switchMap((gpsCoords: GpsCoords) =>
      // TODO: test cancelling reverse lookup
      this.locationIqService.reverse(gpsCoords).pipe(
        tap((res) => {
          this.store("currentLocation").assign({ gpsCoords, city: res.city });
        }),
        catchError((err) => {
          // TODO: test this keep refreshing
          console.error(err);
          this.store("currentLocation")("city").delete();
          return of(0);
        }),
      ),
    );
  }

  private observeSearches() {
    const customLocationStore = this.store("customLocation");
    this.subscribeTo(
      customLocationStore("search").$.pipe(
        filter(() => {
          const location = customLocationStore.state();
          return location.search.length > 0 && !location.gpsCoords;
        }),
        // TODO: test cancelling
        switchMap((search) => this.locationIqService.forward(search)),
      ),
      bindKey(customLocationStore, "assign"),
    );
  }
}
