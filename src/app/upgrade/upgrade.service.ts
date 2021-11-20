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
    this.registerMigration(10, this.upgradeFrom10);
    this.registerMigration(9, this.upgradeFrom9);
    this.registerMigration(8, this.upgradeFrom8);
    this.registerMigration(7, this.upgradeFrom7);
    this.registerMigration(undefined, this.upgradeFromLegacy);
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

  private upgradeFrom10(state: any): WeatherState {
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

  private upgradeFrom9(state: any): WeatherState {
    this.whatsNewService.add('Climacell changed its name to Tomorrow.io');
    return {
      ...state,
      _version: 10,
      sources: {
        ...omit(state.sources, 'climacell'),
        tomorrowIo: {
          ...state.sources.climacell,
          label: 'Tomorrow.io',
        },
      },
    };
  }

  private upgradeFrom8(state: WeatherState): WeatherState {
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

  private upgradeFrom7(state: WeatherState): WeatherState {
    return {
      ...state,
      _version: 8,
      viewRange: { min: -5400000, max: 81000000 },
    };
  }

  private upgradeFromLegacy(state: any): WeatherState {
    const oldVersion = (state as any).version;
    assert(oldVersion === 6, 'Unable to upgrade from version ' + oldVersion);

    state = cloneDeep(state);
    state.sources = {
      ...state.sources,
      climacell: { label: 'Climacell', show: false, forecast: {} },
    };
    delete (state as any).version;
    state._version = 7;

    this.whatsNewService.add(
      'You can get your forecast from Tomorrow.io. Check it out in the Sources section of the settings.',
    );
    return state;
  }
}
