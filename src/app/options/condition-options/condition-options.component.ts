import { ChangeDetectionStrategy, Component } from "@angular/core";
import { trackEvent } from "app/to-replace/event-tracking/s-track.directive";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";
import { Condition, conditionInfo } from "../../state/condition";
import { WeatherState } from "../../state/weather-state";
import { WeatherStore } from "../../state/weather-store";

@Component({
  selector: "app-condition-options",
  templateUrl: "./condition-options.component.html",
  styleUrls: ["./condition-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionOptionsComponent {
  store: StoreObject<WeatherState>;
  conditions = values(Condition);
  conditionInfo: any = conditionInfo;
  trackEvent = trackEvent;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
