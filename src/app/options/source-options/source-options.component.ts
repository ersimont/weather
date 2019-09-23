import { Component, ChangeDetectionStrategy } from "@angular/core";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";
import { SourceId } from "../../state/source";
import { WeatherState } from "../../state/weather-state";
import { WeatherStore } from "../../state/weather-store";

@Component({
  selector: "app-source-options",
  templateUrl: "./source-options.component.html",
  styleUrls: ["./source-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceOptionsComponent {
  store: StoreObject<WeatherState>;
  sourceIds = values(SourceId);

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
