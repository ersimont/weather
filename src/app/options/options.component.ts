import { ChangeDetectionStrategy, Component } from "@angular/core";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { StoreObject } from "ng-app-state";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  store: StoreObject<WeatherState>;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
