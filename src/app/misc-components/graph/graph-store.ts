import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { buildDatasets } from 'app/misc-components/graph/chartjs-datasets';
import {
  buildNightBoxes,
  buildNowLine,
} from 'app/misc-components/graph/chartjs-options';
import { GraphState } from 'app/misc-components/graph/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { AppStore } from 'ng-app-state';
import { delayOnMicrotaskQueue } from 's-rxjs-utils';

@Injectable({ providedIn: 'root' })
export class GraphStore extends AppStore<GraphState> {
  constructor(
    private locationService: LocationService,
    ngrxStore: Store<any>,
    weatherStore: WeatherStore,
  ) {
    super(ngrxStore, 'graph', new GraphState());
    this.updateFromWeatherState(weatherStore.state());
    // TODO: figure a way to use subscribeTo
    weatherStore.$.pipe(delayOnMicrotaskQueue()).subscribe((weatherState) => {
      this.updateFromWeatherState(weatherState);
    });
  }

  private updateFromWeatherState(weatherState: WeatherState) {
    this.batch((batch) => {
      batch('data').set(buildDatasets(weatherState));

      // TODO: move to subscription on combination time & gps
      const gpsCoords = this.locationService.getLocation().gpsCoords;
      const nightBoxes = gpsCoords ? buildNightBoxes(gpsCoords) : [];
      const annotations = [...nightBoxes, buildNowLine()];
      batch('options')('annotation' as any).assign({ annotations });
    });
  }
}
