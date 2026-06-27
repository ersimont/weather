import { inject, Service } from '@angular/core';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import { PersistentStore } from '@s-libs/signal-store';
import { logToReduxDevtoolsExtension } from 'app/to-replace/js-core/redux/log-to-redux-devtools-extension';
import { EventTrackingService } from 'app/to-replace/mixpanel-core/event-tracking.service';
import { UpgradeService } from 'app/upgrade/upgrade.service';
import { WeatherState } from './weather-state';

@Service()
export class WeatherStore extends mixInInjectableSuperclass(
  PersistentStore,
)<WeatherState> {
  constructor() {
    const eventTrackingService = inject(EventTrackingService);
    const upgradeService = inject(UpgradeService);

    const freshState = new WeatherState();
    super('weather', freshState, { migrator: upgradeService });

    if (this.state === freshState) {
      eventTrackingService.track('initialize_fresh_state', {
        category: 'initialization',
      });
    }

    logToReduxDevtoolsExtension(() => this.state, {
      name: 'WeatherStore',
      autoPause: true,
    });
  }
}
