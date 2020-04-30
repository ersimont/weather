import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from "@angular/core";
import { MatExpansionPanel } from "@angular/material/expansion";
import { LocationService } from "app/services/location.service";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { ofType } from "app/to-replace/of-type";
import { StoreObject } from "ng-app-state";
import { DirectiveSuperclass } from "s-ng-utils";

@Component({
  selector: "app-location-options",
  templateUrl: "./location-options.component.html",
  styleUrls: ["./location-options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOptionsComponent extends DirectiveSuperclass {
  store: StoreObject<WeatherState>;
  useCurrentLocation: boolean;
  customSearch: string;

  @ViewChild("panel", { read: MatExpansionPanel })
  private panel!: MatExpansionPanel;

  constructor(
    private eventTrackingService: EventTrackingService,
    injector: Injector,
    public locationService: LocationService,
    store: WeatherStore,
  ) {
    super(injector);
    this.store = store.withCaching();
    this.useCurrentLocation = store.state().useCurrentLocation;
    this.customSearch = store.state().customLocation.search;

    this.subscribeTo(store.action$.pipe(ofType("ask_for_location")), () => {
      this.panel.open();
    });
  }

  setUseCurrentLocation(value: boolean) {
    this.locationService.setUseCurrentLocation(value);
    this.eventTrackingService.track(
      "change_current_selection",
      "change_location",
    );
  }
}
