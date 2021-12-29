import { Injectable } from '@angular/core';
import { PersistentStore } from '@s-libs/app-state';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import { logToReduxDevtoolsExtension } from '@s-libs/rxjs-core';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
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

    if (this.state() === freshState) {
      eventTrackingService.track(
        'initialize_fresh_state',
        'initialization',
        false,
      );
    }

    logToReduxDevtoolsExtension(this.$, {
      name: 'WeatherStore',
      autoPause: true,
    });
  }
}
