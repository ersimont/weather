import { Injector } from "@angular/core";
import { StoreObject } from "ng-app-state";
import { filter, switchMapTo } from "rxjs/operators";
import { InjectableSuperclass } from "s-ng-utils";
import { GpsCoords, LocationService } from "../location.service";
import { RefreshService } from "../refresh.service";
import { Forecast } from "../state/forecast";
import { Source, SourceId } from "../state/source";
import { WeatherStore } from "../state/weather-store";

export abstract class AbstractSource extends InjectableSuperclass {
  private locationService: LocationService;
  private refreshService: RefreshService;
  private sourceStore: StoreObject<Source>;

  constructor(private key: SourceId, injector: Injector) {
    super();
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
    const gpsCoords = this.locationService.getGpsCoords();
    if (!gpsCoords) {
      throw new Error("no coordinates");
    }

    const forecast = await this.fetch(gpsCoords);
    this.sourceStore("forecast").set(forecast);
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
