import { Component, ChangeDetectionStrategy } from "@angular/core";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";
import { AmountUnit, SpeedUnit, TempUnit } from "../../state/units";
import { WeatherState } from "../../state/weather-state";
import { WeatherStore } from "../../state/weather-store";

@Component({
  selector: "app-unit-options",
  templateUrl: "./unit-options.component.html",
  styleUrls: ["./unit-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitOptionsComponent {
  store: StoreObject<WeatherState>;
  unitOptions = [
    { type: "temp", options: values(TempUnit) },
    { type: "amount", options: values(AmountUnit) },
    { type: "speed", options: values(SpeedUnit) },
  ];

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
