import { Injector } from "@angular/core";
import { InjectableSuperclass } from "s-ng-utils";
import { GpsCoords, LocationService } from "../location.service";
import { Forecast } from "../state/forecast";
import { SourceId } from "../state/source";
import { WeatherStore } from "../state/weather-store";

export abstract class AbstractSource extends InjectableSuperclass {
  private locationService: LocationService;
  private store: WeatherStore;

  constructor(private key: SourceId, injector: Injector) {
    super();
    this.locationService = injector.get(LocationService);
    this.store = injector.get(WeatherStore);
  }

  async refresh() {
    const gpsCoords = this.locationService.getGpsCoords();
    if (!gpsCoords) {
      throw new Error("no coordinates");
    }

    const forecast = await this.fetch(gpsCoords);
    this.store("sources")(this.key)("forecast").set(forecast);
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
