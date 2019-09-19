import { ChangeDetectionStrategy, Component } from "@angular/core";
import { values } from "micro-dash";
import { spreadObjectStore$, StoreObject } from "ng-app-state";
import { Observable } from "rxjs";
import { Condition, conditionDisplays } from "../state/condition";
import { Source } from "../state/source";
import { WeatherState } from "../state/weather-state";
import { WeatherStore } from "../state/weather-store";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  store: StoreObject<WeatherState>;
  conditions = values(Condition);
  conditionDisplays: any = conditionDisplays;
  sourceStores$: Observable<Array<StoreObject<Source>>>;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
    this.sourceStores$ = spreadObjectStore$(this.store("sources"));
  }
}
