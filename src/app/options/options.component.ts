import { ChangeDetectionStrategy, Component } from "@angular/core";
import { values } from "micro-dash";
import { StoreObject } from "ng-app-state";
import { LocationService } from "../location.service";
import { RefreshService } from "../refresh.service";
import { Condition, conditionInfo } from "../state/condition";
import { SourceId } from "../state/source";
import { AmountUnit, SpeedUnit, TempUnit } from "../state/units";
import { WeatherState } from "../state/weather-state";
import { WeatherStore } from "../state/weather-store";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  store: StoreObject<WeatherState>;
  sourceIds = values(SourceId);
  unitOptions = [
    { type: "temp", options: values(TempUnit) },
    { type: "amount", options: values(AmountUnit) },
    { type: "speed", options: values(SpeedUnit) },
  ];
  conditions = values(Condition);
  conditionInfo: any = conditionInfo;

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
