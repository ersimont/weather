import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AmountUnit, SpeedUnit, TempUnit, UnitType } from 'app/state/units';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { values } from 'micro-dash';
import { StoreObject } from 'ng-app-state';

@Component({
  selector: 'app-unit-options',
  templateUrl: './unit-options.component.html',
  styleUrls: ['./unit-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitOptionsComponent {
  store: StoreObject<WeatherState>;
  unitOptions = [
    { type: 'temp', options: values(TempUnit) },
    { type: 'amount', options: values(AmountUnit) },
    { type: 'speed', options: values(SpeedUnit) },
  ];

  constructor(
    private eventTrackingService: EventTrackingService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
  }

  trackChange(unitType: UnitType) {
    this.eventTrackingService.track(`change_${unitType}`, 'change_unit');
  }
}
