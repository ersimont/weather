import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { RefreshService } from "app/services/refresh.service";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { debounce } from "micro-dash";
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
    private locationService: LocationService,
    private refreshService: RefreshService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
    this.useCurrentLocation = store.state().useCurrentLocation;
    this.customSearch = store.state().customLocation.search;
  }

  selectCustomLocation() {
    if (!this.useCurrentLocation) {
      return;
    }

    this.useCurrentLocation = false;
    this.trackSelect("custom");
  }

  trackSelect(currentOrCustom: "current" | "custom") {
    this.eventTrackingService.track(
      `select_${currentOrCustom}_location`,
      "change_location",
    );
  }

  submit = debounce(async () => {
    if (this.useCurrentLocation) {
      this.store("useCurrentLocation").set(true);
      return;
    }

    const searchStore = this.store("customLocation")("search");
    if (this.customSearch === searchStore.state()) {
      this.store("useCurrentLocation").set(false);
      return;
    }

    await this.locationService.setCustom(this.customSearch);

    if (this.store.state().useCurrentLocation) {
      this.store("useCurrentLocation").set(false);
    } else {
      this.refreshService.refresh();
    }
  }, 100); // there is a delay between input (blur) and radio (change)
}
