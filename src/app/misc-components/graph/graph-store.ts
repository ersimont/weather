import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { buildDatasets } from 'app/misc-components/graph/chartjs-datasets';
import {
  buildBoundaries,
  buildNightBoxes,
  buildNowLine,
} from 'app/misc-components/graph/chartjs-options';
import { GraphState } from 'app/misc-components/graph/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { mixInInjectableSuperclass } from 'app/to-replace/injectable-superclass';
import { AppStore } from 'ng-app-state';
import { interval } from 'rxjs';
import { startWith, switchMapTo } from 'rxjs/operators';
import { convertTime } from 's-js-utils';
import { delayOnMicrotaskQueue } from 's-rxjs-utils';

@Injectable({ providedIn: 'root' })
export class GraphStore extends mixInInjectableSuperclass(AppStore)<
  GraphState
> {
  constructor(
    locationService: LocationService,
    ngrxStore: Store<any>,
    weatherStore: WeatherStore,
  ) {
    super(ngrxStore, 'graph', new GraphState());

    // options
    this.snapToRange(1);
    const tick = interval(60000).pipe(startWith(0));
    tick.subscribe(() => {
      this.updateBoundaries(Date.now());
    });
    tick.pipe(switchMapTo(locationService.$)).subscribe((location) => {
      this.updateAnnotations(location.gpsCoords, Date.now());
    });

    // data
    this.updateFromWeatherState(weatherStore.state());
    this.subscribeTo(
      weatherStore.$.pipe(delayOnMicrotaskQueue()),
      (weatherState) => {
        this.updateFromWeatherState(weatherState);
      },
    );
  }

  snapToRange(days: number) {
    const d = new Date();
    d.setHours(d.getHours() - 1, 0, 0, 0);
    const min = d.getTime();
    this.setRange({ min, max: min + convertTime(days, 'd', 'ms') });
  }

  setRange(range: { min: number; max: number }) {
    this('options')('scales')('xAxes')(0)('ticks').assign(range);
  }

  private updateAnnotations(gpsCoords: GpsCoords | undefined, now: number) {
    const nightBoxes = gpsCoords ? buildNightBoxes(now, gpsCoords) : [];
    const annotations = [...nightBoxes, buildNowLine(now)];
    this('options')('annotation' as any).assign({ annotations });
  }

  private updateBoundaries(now: number) {
    const maxRange = buildBoundaries(now);
    this('options')('plugins')('zoom').batch((batch) => {
      batch('pan').assign(maxRange);
      batch('zoom').assign(maxRange);
    });
  }

  private updateFromWeatherState(weatherState: WeatherState) {
    this('data').set(buildDatasets(weatherState));
  }
}
