import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SourceId } from "app/state/source";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { trackEvent } from "app/to-replace/event-tracking/s-track.directive";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";

@Component({
  selector: "app-source-options",
  templateUrl: "./source-options.component.html",
  styleUrls: ["./source-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceOptionsComponent {
  store: StoreObject<WeatherState>;
  sourceIds = values(SourceId);
  trackEvent = trackEvent;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
