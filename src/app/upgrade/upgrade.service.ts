import { Injectable } from '@angular/core';
import { WeatherState } from 'app/state/weather-state';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { WhatsNewService } from 'app/upgrade/whats-new.service';
import { cloneDeep, omit } from '@s-libs/micro-dash';
import { assert, MigrationManager } from '@s-libs/js-core';

@Injectable({ providedIn: 'root' })
export class UpgradeService extends MigrationManager<WeatherState> {
  constructor(
    private errorService: SnackBarErrorService,
    private whatsNewService: WhatsNewService,
  ) {
    super();
    this.registerMigration(11, this.#upgradeFrom11);
    this.registerMigration(10, this.#upgradeFrom10);
    this.registerMigration(9, this.#upgradeFrom9);
    this.registerMigration(8, this.#upgradeFrom8);
    this.registerMigration(7, this.#upgradeFrom7);
    this.registerMigration(undefined, this.#upgradeFromLegacy);
  }

  protected override onError(
    error: any,
    _object: unknown,
    defaultValue: WeatherState,
  ): WeatherState {
    // test this once there is a way to activate it
    this.errorService.handleError(error);
    return defaultValue;
  }

  #upgradeFrom11(state: any): WeatherState {
    this.whatsNewService.add('Tomorrow.io is no longer available.');
    return {
      ...state,
      _version: 12,
      sources: omit(state.sources, 'tomorrowIo'),
    };
  }

  #upgradeFrom10(state: any): WeatherState {
    this.whatsNewService.add(
      'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
    );
    return {
      ...state,
      _version: 11,
      sources: {
        ...state.sources,
        visualCrossing: { label: 'Visual Crossing', show: false, forecast: {} },
      },
    };
  }

  #upgradeFrom9(state: any): WeatherState {
    return {
      ...state,
      _version: 10,
      sources: { ...omit(state.sources, 'climacell') },
    };
  }

  #upgradeFrom8(state: WeatherState): WeatherState {
    state = cloneDeep(state);
    state.sources = {
      ...state.sources,
      openWeather: { label: 'OpenWeather', show: false, forecast: {} },
    };
    state._version = 9;

    this.whatsNewService.add(
      'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
    );
    return state;
  }

  #upgradeFrom7(state: WeatherState): WeatherState {
    return {
      ...state,
      _version: 8,
      viewRange: { min: -5400000, max: 81000000 },
    };
  }

  #upgradeFromLegacy(state: any): WeatherState {
    const oldVersion = (state as any).version;
    assert(oldVersion === 6, 'Unable to upgrade from version ' + oldVersion);

    state = cloneDeep(state);
    delete (state as any).version;
    state._version = 7;
    return state;
  }
}
