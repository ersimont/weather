import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from "@angular/core";
import { MatExpansionPanel } from "@angular/material";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { ofType } from "app/to-replace/of-type";
import { StoreObject } from "ng-app-state";
import { DirectiveSuperclass } from "s-ng-utils";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent extends DirectiveSuperclass {
  store: StoreObject<WeatherState>;

  @ViewChild("locationPanel", { read: MatExpansionPanel })
  private locationPanel!: MatExpansionPanel;

  constructor(injector: Injector, store: WeatherStore) {
    super(injector);
    this.store = store.withCaching();

    this.subscribeTo(store.action$.pipe(ofType("ask_for_location")), () => {
      this.locationPanel.open();
    });
  }
}
