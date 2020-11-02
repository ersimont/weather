import { Injectable } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { bindKey } from '@s-libs/micro-dash';
import { logToReduxDevtoolsExtension } from '@s-libs/rxjs-core';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { mixInInjectableSuperclass } from 'app/to-replace/injectable-superclass';
import { Persistence } from 'app/to-replace/persistence/persistence';
import { UpgradeService } from 'app/upgrade/upgrade.service';
import { WeatherState } from './weather-state';

@Injectable({ providedIn: 'root' })
export class WeatherStore extends mixInInjectableSuperclass(RootStore)<
  WeatherState
> {
  constructor(
    eventTrackingService: EventTrackingService,
    upgradeService: UpgradeService,
  ) {
    const persistence = new Persistence<WeatherState>('weather');
    const freshState = new WeatherState();
    const initialState = upgradeService.run(persistence, freshState);
    super(initialState);

    if (initialState === freshState) {
      eventTrackingService.track(
        'initialize_fresh_state',
        'initialization',
        false,
      );
    }

    this.subscribeTo(this.$, bindKey(persistence, 'put'));
    logToReduxDevtoolsExtension(this.$, {
      name: 'WeatherStore',
      autoPause: true,
    });
  }
}
