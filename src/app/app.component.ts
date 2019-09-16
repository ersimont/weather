import { Component } from "@angular/core";
import { WeatherState } from "./state/weather-state";
import { spreadObjectStore$, StoreObject } from "ng-app-state";
import { WeatherStore } from "./state/weather-store";
import { values } from "micro-dash";
import { Condition, conditionDisplays } from "./state/condition";
import { Observable } from "rxjs";
import { Source } from "./state/source";
import { WeatherGov } from "./sources/weather-gov";
import { WeatherUnlocked } from "./sources/weather-unlocked";
import { RefreshService } from "./refresh.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  store: StoreObject<WeatherState>;
  conditions = values(Condition);
  conditionDisplays = values(conditionDisplays);
  sourceStores$: Observable<Array<StoreObject<Source>>>;

  constructor(
    private refreshService: RefreshService,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
    this.sourceStores$ = spreadObjectStore$(this.store("sources"));
    this.initializeSources();
  }

  private async initializeSources() {
    await this.refreshService.refresh();
    this.weatherGov.initialize();
    this.weatherUnlocked.initialize();
  }
}
