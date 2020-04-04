import { Injector } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { RefreshService } from "app/services/refresh.service";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { Source, SourceId } from "app/state/source";
import { WeatherStore } from "app/state/weather-store";
import { ErrorService } from "app/to-replace/error.service";
import { StoreObject } from "ng-app-state";
import { filter, switchMapTo } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";

export abstract class AbstractSource extends InjectableSuperclass {
  private errorService: ErrorService;
  private locationService: LocationService;
  private refreshService: RefreshService;
  private sourceStore: StoreObject<Source>;

  constructor(private key: SourceId, injector: Injector) {
    super();
    this.errorService = injector.get(ErrorService);
    this.locationService = injector.get(LocationService);
    this.refreshService = injector.get(RefreshService);

    const store = injector.get(WeatherStore);
    this.sourceStore = store("sources")(this.key);
  }

  initialize() {
    this.subscribeTo(
      this.refreshService.refresh$.pipe(
        switchMapTo(this.sourceStore("show").$),
        filter((show) => !!show),
      ),
      this.refresh,
    );
  }

  private async refresh() {
    const gpsCoords = this.locationService.getLocation().gpsCoords;
    let forecast;
    if (gpsCoords) {
      forecast = await this.fetch(gpsCoords);
    } else {
      this.errorService.show("Location not available");
      forecast = {};
    }

    this.sourceStore("forecast").set(forecast);
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
