import { inject, Service } from '@angular/core';
import { omit } from '@s-libs/micro-dash';
import { Source } from 'app/state/source';
import { STATE_VERSION, WeatherState } from 'app/state/weather-state';
import { Migrations } from 'app/to-replace/js-core/persistence/migrations';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

/* eslint-disable @typescript-eslint/no-unsafe-return */

@Service()
export class UpgradeService extends Migrations<WeatherState> {
  // readonly #errorService = inject(SnackBarErrorService);
  readonly #whatsNewService = inject(WhatsNewService);

  constructor() {
    super(STATE_VERSION);
    this.register(12, this.#upgradeFrom12);
    this.register(11, this.#upgradeFrom11);
  }

  #upgradeFrom12(state: any): WeatherState {
    this.#whatsNewService.add(
      'Weather Unlocked is no longer available. They shut down their API.',
    );
    this.#whatsNewService.add(
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
    this.#whatsNewService.add('Tomorrow.io is no longer available.');
    return {
      ...state,
      _version: 12,
      sources: omit(state.sources, 'tomorrowIo'),
    };
  }
}
