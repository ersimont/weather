import { Injector } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { RefreshService } from "app/services/refresh.service";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { Source, SourceId } from "app/state/source";
import { WeatherStore } from "app/state/weather-store";
import { SnackBarErrorService } from "app/to-replace/snack-bar-error.service";
import { retryAfter } from "app/to-replace/retry-after";
import { StoreObject } from "ng-app-state";
import { combineLatest, Observable, of } from "rxjs";
import { skip, switchMap, switchMapTo, tap } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";

export const notAvailableHere = Symbol();

export abstract class AbstractSource extends InjectableSuperclass {
  private errorService: SnackBarErrorService;
  private locationService: LocationService;
  private refreshService: RefreshService;
  private store: WeatherStore;
  private sourceStore: StoreObject<Source>;

  constructor(private key: SourceId, injector: Injector) {
    super();
    this.errorService = injector.get(SnackBarErrorService);
    this.locationService = injector.get(LocationService);
    this.refreshService = injector.get(RefreshService);
    this.store = injector.get(WeatherStore);

    this.sourceStore = this.store("sources")(this.key);
  }

  initialize(fallback?: SourceId) {
    this.subscribeTo(
      this.refreshService.refresh$.pipe(
        switchMapTo(this.sourceStore("show").$),
        switchMap((show) => this.refresh(show)),
        retryAfter((error) => {
          this.handleError(error, fallback);
          return combineLatest([
            this.refreshService.refresh$,
            this.sourceStore("show").$,
          ]).pipe(skip(1));
        }),
      ),
    );
  }

  protected abstract fetch(gpsCoords: GpsCoords): Observable<Forecast>;

  private refresh(show: boolean) {
    if (!show) {
      return of(0);
    }

    const gpsCoords = this.locationService.getLocation().gpsCoords;
    if (!gpsCoords) {
      this.errorService.show("Location not available");
      this.setForecast({});
      return of(0);
    }

    return this.fetch(gpsCoords).pipe(
      tap((forecast) => {
        this.setForecast(forecast);
      }),
    );
  }

  private setForecast(forecast: Forecast) {
    this.store.batch((batch) => {
      batch("allowSourceFallback").set(false);
      this.sourceStore("forecast").inBatch(batch).set(forecast);
    });
  }

  private handleError(error: any, fallback: SourceId | undefined) {
    if (error !== notAvailableHere) {
      this.errorService.handleError(error);
    } else if (fallback && this.store.state().allowSourceFallback) {
      this.store.batch((batch) => {
        this.sourceStore("show").inBatch(batch).set(false);
        batch("sources")(fallback)("show").set(true);
      });
    } else {
      const label = this.sourceStore.state().label;
      this.errorService.show(
        `${label} is not available here. Try another source (in the settings).`,
      );
    }
  }
}
