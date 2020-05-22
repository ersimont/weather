import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { mixInInjectableSuperclass } from 'app/to-replace/injectable-superclass';
import { Persistence } from 'app/to-replace/persistence/persistence';
import { UpgradeService } from 'app/upgrade/upgrade.service';
import { bindKey } from 'micro-dash';
import { AppStore } from 'ng-app-state';
import { WeatherState } from './weather-state';

@Injectable({ providedIn: 'root' })
export class WeatherStore extends mixInInjectableSuperclass(AppStore)<
  WeatherState
> {
  constructor(
    eventTrackingService: EventTrackingService,
    ngrxStore: Store<any>,
    upgradeService: UpgradeService,
  ) {
    const persistence = new Persistence<WeatherState>('weather');
    const freshState = new WeatherState();
    const initialState = persistence.get({
      defaultValue: freshState,
      upgrader: upgradeService,
    });
    super(ngrxStore, 'weather', initialState);

    if (initialState === freshState) {
      eventTrackingService.track(
        'initialize_fresh_state',
        'initialization',
        false,
      );
    }

    this.subscribeTo(this.$, bindKey(persistence, 'put'));
  }
}
