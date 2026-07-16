import { inject, Service } from '@angular/core';
import { MigrationManager } from '@s-libs/js-core';
import { omit } from '@s-libs/micro-dash';
import { Source } from 'app/state/source';
import { WeatherState } from 'app/state/weather-state';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

/* eslint-disable @typescript-eslint/no-unsafe-return */

@Service()
export class UpgradeService extends MigrationManager<WeatherState> {
  private errorService = inject(SnackBarErrorService);
  private whatsNewService = inject(WhatsNewService);

  constructor() {
    super();
    this.registerMigration(12, this.#upgradeFrom12);
    this.registerMigration(11, this.#upgradeFrom11);
  }

  protected override onError(
    error: unknown,
    _object: unknown,
    defaultValue: WeatherState,
  ): WeatherState {
    // test this once there is a way to activate it
    this.errorService.handleError(error);
    return defaultValue;
  }

  #upgradeFrom12(state: any): WeatherState {
    this.whatsNewService.add(
      'Weather Unlocked is no longer available. They shut down their API.',
    );
    this.whatsNewService.add(
      'You can get forecasts from Open-Mateo. Find it in the Sources section of your settings.',
    );
    return {
      ...state,
      _version: 13,
      sources: {
        ...omit(state.sources, 'weatherUnlocked'),
        openMateo: new Source('Open-Mateo', false),
      },
    };
  }

  #upgradeFrom11(state: any): WeatherState {
    this.whatsNewService.add('Tomorrow.io is no longer available.');
    return {
      ...state,
      _version: 12,
      sources: omit(state.sources, 'tomorrowIo'),
    };
  }
}
