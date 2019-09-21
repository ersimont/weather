import { ChangeDetectionStrategy, Component } from "@angular/core";
import { values } from "micro-dash";
import { spreadObjectStore$, StoreObject } from "ng-app-state";
import { Observable } from "rxjs";
import { Condition, conditionInfo } from "../state/condition";
import { Source } from "../state/source";
import { AmountUnit, SpeedUnit, TempUnit } from "../state/units";
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
  sourceStores$: Observable<Array<StoreObject<Source>>>;
  unitOptions = [
    { type: "temp", options: values(TempUnit) },
    { type: "amount", options: values(AmountUnit) },
    { type: "speed", options: values(SpeedUnit) },
  ];
  conditions = values(Condition);
  conditionInfo = conditionInfo;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
    this.sourceStores$ = spreadObjectStore$(this.store("sources"));
  }
}
