import { Injectable } from '@angular/core';
import { WeatherState } from 'app/state/weather-state';
import { UpgradeSuperclass } from 'app/to-replace/persistence/upgrade-superclass';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { WhatsNewService } from 'app/upgrade/whats-new.service';
import { cloneDeep } from 'micro-dash';
import { assert } from 's-js-utils';

@Injectable({ providedIn: 'root' })
export class UpgradeService extends UpgradeSuperclass<WeatherState> {
  constructor(
    private errorService: SnackBarErrorService,
    private whatsNewService: WhatsNewService,
  ) {
    super();
    this.registerVersion(8, this.upgradeFrom8);
    this.registerVersion(7, this.upgradeFrom7);
    this.registerVersion(undefined, this.upgradeFromLegacy);
  }

  protected onError(error: any) {
    // test this once there is a way to activate it
    this.errorService.handleError(error);
  }

  private upgradeFrom8(state: WeatherState) {
    state = cloneDeep(state);
    state.sources = {
      openWeather: { label: 'OpenWeather', show: false, forecast: {} },
      ...state.sources,
    };
    state._version = 9;

    this.whatsNewService.add(
      'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
    );
    return state;
  }

  private upgradeFrom7(state: WeatherState) {
    return {
      ...state,
      _version: 8,
      viewRange: { min: -5400000, max: 81000000 },
    };
  }

  private upgradeFromLegacy(state: WeatherState) {
    const oldVersion = (state as any).version;
    assert(oldVersion === 6, 'Unable to upgrade from version ' + oldVersion);

    state = cloneDeep(state);
    state.sources = {
      climacell: { label: 'Climacell', show: false, forecast: {} },
      ...state.sources,
    };
    delete (state as any).version;
    state._version = 7;

    this.whatsNewService.add(
      'You can get your forecast from Climacell. Check it out in the Sources section of the settings.',
    );
    return state;
  }
}
