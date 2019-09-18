import { Component } from "@angular/core";
import { values } from "micro-dash";
import { Observable } from "rxjs";
import { spreadObjectStore$, StoreObject } from "ng-app-state";
import { Source } from "../state/source";
import { Condition, conditionDisplays } from "../state/condition";
import { WeatherStore } from "../state/weather-store";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
})
export class OptionsComponent {
  conditions = values(Condition);
  conditionDisplays = values(conditionDisplays);
  sourceStores$: Observable<Array<StoreObject<Source>>>;

  constructor(store: WeatherStore) {
    this.sourceStores$ = spreadObjectStore$(store.withCaching()("sources"));
  }
}
