import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Condition, conditionInfo } from "app/state/condition";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { bindKey, values } from "micro-dash";
import { StoreObject } from "ng-app-state";

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
  trackEvent: EventTrackingService["track"];

  constructor(eventTrackingService: EventTrackingService, store: WeatherStore) {
    this.trackEvent = bindKey(eventTrackingService, "track");
    this.store = store.withCaching();
  }
}
