import { Injectable } from '@angular/core';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import { PersistentStore } from '@s-libs/signal-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { logToReduxDevtoolsExtension } from 'app/to-replace/js-core/redux/log-to-redux-devtools-extension';
import { UpgradeService } from 'app/upgrade/upgrade.service';
import { WeatherState } from './weather-state';

@Injectable({ providedIn: 'root' })
export class WeatherStore extends mixInInjectableSuperclass(
  PersistentStore,
)<WeatherState> {
  constructor(
    eventTrackingService: EventTrackingService,
    upgradeService: UpgradeService,
  ) {
    const freshState = new WeatherState();
    super('weather', freshState, { migrator: upgradeService });

    if (this.state === freshState) {
      eventTrackingService.track(
        'initialize_fresh_state',
        'initialization',
        false,
      );
    }

    logToReduxDevtoolsExtension(() => this.state, {
      name: 'WeatherStore',
      autoPause: true,
    });
  }
}
