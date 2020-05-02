import { Injectable } from "@angular/core";
import { WeatherState } from "app/state/weather-state";
import { WeatherStore } from "app/state/weather-store";
import { mixInInjectable } from "app/to-replace/injectable-mixin";
import { Persistence } from "app/to-replace/persistence/persistence";
import { UpgradeSuperclass } from "app/to-replace/persistence/upgrade-superclass";
import { SnackBarErrorService } from "app/to-replace/snack-bar-error.service";
import { bindKey } from "micro-dash";

// TODO: some kind of "what's new"
// TODO: see if there's a fancy way to auto-make a mixin from a class
@Injectable({ providedIn: "root" })
export class PersistenceService extends mixInInjectable(UpgradeSuperclass)<
  WeatherState
> {
  private persistence = new Persistence<WeatherState>("weather");

  constructor(private errorService: SnackBarErrorService) {
    super();
  }

  getInitialValue() {
    return this.persistence.get({
      defaultValue: new WeatherState(),
      upgrader: this,
    });
  }

  start(store: WeatherStore) {
    this.subscribeTo(store.$, bindKey(this.persistence, "put"));
  }

  protected upgradeFromLegacy(state: WeatherState) {
    state.sources = {
      climacell: { label: "Climacell", show: false, forecast: {} },
      ...state.sources,
    };
    delete (state as any).version;
    state._version = 7;
  }

  protected onError(error: any) {
    console.log(error); // TODO: log to GA or bigquery or something
    this.errorService.show(
      "Oops! We were unable to upgrade your settings from the previous version.",
    );
  }
}
