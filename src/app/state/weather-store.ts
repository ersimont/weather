import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Persistence } from "app/to-replace/persistence/persistence";
import { UpgradeService } from "app/upgrade/upgrade.service";
import { bindKey } from "micro-dash";
import { AppStore } from "ng-app-state";
import { WeatherState } from "./weather-state";

@Injectable({ providedIn: "root" })
export class WeatherStore extends AppStore<WeatherState> {
  constructor(ngrxStore: Store<any>, upgradeService: UpgradeService) {
    const persistence = new Persistence<WeatherState>("weather");
    super(
      ngrxStore,
      "weather",
      persistence.get({
        defaultValue: new WeatherState(),
        upgrader: upgradeService,
      }),
    );

    // TODO: mix injectablesuperclass into this for subscribeTo
    this.$.subscribe(bindKey(persistence, "put"));
  }
}
