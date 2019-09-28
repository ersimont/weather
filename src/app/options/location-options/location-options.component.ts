import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { StoreObject } from "ng-app-state";

@Component({
  selector: "app-location-options",
  templateUrl: "./location-options.component.html",
  styleUrls: ["./location-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOptionsComponent {
  store: StoreObject<WeatherState>;
  useCurrentLocation: boolean;
  customSearch: string;

  constructor(
    private eventTrackingService: EventTrackingService,
    public locationService: LocationService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
    this.useCurrentLocation = store.state().useCurrentLocation;
    this.customSearch = store.state().customLocation.search;
  }

  trackCurrentSelection() {
    this.eventTrackingService.track(
      "change_current_selection",
      "change_location",
    );
  }
}
