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
  }

  protected upgradeFromLegacy(state: WeatherState) {
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

  protected onError(error: any) {
    // test this once there is a way to activate it
    this.errorService.handleError(error);
  }
}
