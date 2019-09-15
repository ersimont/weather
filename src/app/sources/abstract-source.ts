import { GpsCoords } from "../gps-coords.service";
import { filter, switchMap } from "rxjs/operators";
import { Injector } from "@angular/core";
import { Forecast } from "../state/forecast";
import { SourceId } from "../state/source";
import { InjectableSuperclass } from "s-ng-utils";
import { WeatherStore } from "../state/weather-store";
import { isDefined } from "s-js-utils";

export abstract class AbstractSource extends InjectableSuperclass {
  constructor(key: SourceId, injector: Injector) {
    super();
    const store = injector.get(WeatherStore);

    this.subscribeTo(
      store("gpsCoords").$.pipe(
        filter(isDefined),
        switchMap(this.fetch.bind(this)),
      ),
      (forecast) => {
        store("sources")(key)("forecast").set(forecast);
      },
    );
  }

  protected abstract async fetch(gpsCoords: GpsCoords): Promise<Forecast>;
}
