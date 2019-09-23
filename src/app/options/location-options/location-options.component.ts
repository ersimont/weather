import { ChangeDetectionStrategy, Component } from "@angular/core";
import { StoreObject } from "ng-app-state";
import { LocationService } from "../../location.service";
import { RefreshService } from "../../refresh.service";
import { WeatherState } from "../../state/weather-state";
import { WeatherStore } from "../../state/weather-store";

@Component({
  selector: "app-location-options",
  templateUrl: "./location-options.component.html",
  styleUrls: ["./location-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOptionsComponent {
  store: StoreObject<WeatherState>;
  custom: string;

  constructor(
    private locationService: LocationService,
    private refreshService: RefreshService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
    this.custom = store.state().customLocation.search;
  }

  async searchIfChanged() {
    const searchStore = this.store("customLocation")("search");
    if (this.custom === searchStore.state()) {
      return;
    }

    await this.locationService.setCustom(this.custom);

    if (this.store.state().useCurrentLocation) {
      this.selectCustom();
    } else {
      this.refreshService.refresh();
    }
  }

  selectCustom() {
    this.store("useCurrentLocation").set(false);
  }
}
