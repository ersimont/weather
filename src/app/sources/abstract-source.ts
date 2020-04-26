import { Injector } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { RefreshService } from "app/services/refresh.service";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { Source, SourceId } from "app/state/source";
import { WeatherStore } from "app/state/weather-store";
import { ErrorService } from "app/to-replace/error.service";
import { retryAfter } from "app/to-replace/retry-after";
import { StoreObject } from "ng-app-state";
import { combineLatest } from "rxjs";
import { filter, skip, switchMap, switchMapTo } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";

export const notAvailableHere = Symbol();

export abstract class AbstractSource extends InjectableSuperclass {
  private errorService: ErrorService;
  private locationService: LocationService;
  private refreshService: RefreshService;
  private store: WeatherStore;
  private sourceStore: StoreObject<Source>;

  constructor(private key: SourceId, injector: Injector) {
    super();
    this.errorService = injector.get(ErrorService);
    this.locationService = injector.get(LocationService);
    this.refreshService = injector.get(RefreshService);
    this.store = injector.get(WeatherStore);

    this.sourceStore = this.store("sources")(this.key);
  }

  initialize(fallback?: SourceId) {
    this.subscribeTo(
      this.refreshService.refresh$.pipe(
        switchMapTo(this.sourceStore("show").$),
        filter(Boolean),
        switchMap(() => this.refresh()),
        // TODO: test switching while in flight, then resolving w/ error
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

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;

  private async refresh() {
    const gpsCoords = this.locationService.getLocation().gpsCoords;
    let forecast: Forecast;
    if (gpsCoords) {
      forecast = await this.fetch(gpsCoords);
    } else {
      this.errorService.show("Location not available");
      forecast = {};
    }

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
