import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SourceId } from 'app/state/source';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { values } from 'micro-dash';
import { StoreObject } from 'ng-app-state';

@Component({
  selector: 'app-source-options',
  templateUrl: './source-options.component.html',
  styleUrls: ['./source-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceOptionsComponent {
  store: StoreObject<WeatherState>;
  sourceIds = values(SourceId);

  constructor(
    private eventTrackingService: EventTrackingService,
    store: WeatherStore,
  ) {
    this.store = store.withCaching();
  }

  trackChange(sourceId: SourceId) {
    this.eventTrackingService.track(`change_${sourceId}`, 'change_source');
  }
}
