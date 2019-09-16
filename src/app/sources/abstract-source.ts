import { GpsCoords } from "../gps-coords.service";
import { filter, switchMap } from "rxjs/operators";
import { Injector } from "@angular/core";
import { Forecast } from "../state/forecast";
import { SourceId } from "../state/source";
import { InjectableSuperclass } from "s-ng-utils";
import { WeatherStore } from "../state/weather-store";
import { isDefined } from "s-js-utils";

export abstract class AbstractSource extends InjectableSuperclass {
  private store!: WeatherStore;

  constructor(private key: SourceId, injector: Injector) {
    super();
    this.store = injector.get(WeatherStore);
  }

  initialize() {
    this.subscribeTo(
      this.store("gpsCoords").$.pipe(
        filter(isDefined),
        switchMap(this.fetch.bind(this)),
      ),
      (forecast) => {
        this.store("sources")(this.key)("forecast").set(forecast);
      },
    );
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
