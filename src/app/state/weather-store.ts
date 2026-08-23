import { ErrorHandler, inject } from '@angular/core';
import { RootStore } from '@s-libs/signal-store';
import { MixpanelService } from 'app/to-replace/mixpanel-core/mixpanel.service';
import { providePersistentStore } from 'app/to-replace/signal-store/provide-persistent-store';
import { UpgradeService } from 'app/upgrade/upgrade.service';
import { WeatherState } from './weather-state';

export class WeatherStore extends RootStore<WeatherState> {}

export const storeProviders = providePersistentStore<
  WeatherState,
  WeatherState
>({
  type: WeatherStore,
  dbName: 'weather-store',
  freshState: () => {
    try {
      const legacyString = localStorage.getItem('weather');
      if (legacyString) {
        return inject(UpgradeService).run(JSON.parse(legacyString));
      }
    } catch (e) {
      inject(ErrorHandler).handleError(e);
    }

    inject(MixpanelService).track('initialize_fresh_state', {
      category: 'initialization',
    });
    return new WeatherState();
  },
  migrations: () => inject(UpgradeService),
});
