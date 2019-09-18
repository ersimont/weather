import { ChangeDetectionStrategy, Component } from "@angular/core";
import { values } from "micro-dash";
import { Observable } from "rxjs";
import { spreadObjectStore$, StoreObject } from "ng-app-state";
import { Source } from "../state/source";
import { Condition, conditionDisplays } from "../state/condition";
import { WeatherStore } from "../state/weather-store";
import { WeatherState } from "../state/weather-state";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  store: StoreObject<WeatherState>;
  conditions = values(Condition);
  conditionDisplays = conditionDisplays;
  sourceStores$: Observable<Array<StoreObject<Source>>>;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
    this.sourceStores$ = spreadObjectStore$(this.store("sources"));
  }
}
