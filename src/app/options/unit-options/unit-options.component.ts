import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AmountUnit, SpeedUnit, TempUnit } from "app/state/units";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { trackEvent } from "app/to-replace/event-tracking/s-track.directive";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";

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
  trackEvent = trackEvent;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
