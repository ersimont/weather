import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocationService } from "app/services/location.service";
import { RefreshService } from "app/services/refresh.service";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
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
    private locationService: LocationService,
    private refreshService: RefreshService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
    this.useCurrentLocation = store.state().useCurrentLocation;
    this.customSearch = store.state().customLocation.search;
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
