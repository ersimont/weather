import { Injectable } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { mapValues } from '@s-libs/micro-dash';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import {
  delayOnMicrotaskQueue,
  logToReduxDevtoolsExtension,
} from '@s-libs/rxjs-core';
import { buildDatasets } from 'app/graph/chartjs-datasets';
import {
  buildBoundaries,
  buildNightBoxes,
  buildNowLine,
} from 'app/graph/chartjs-options';
import { GraphState } from 'app/graph/state/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { GpsCoords } from 'app/state/location';
import { ViewRange } from 'app/state/viewRange';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { combineLatest, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable()
export class GraphStore extends mixInInjectableSuperclass(
  RootStore,
)<GraphState> {
  constructor(
    private locationService: LocationService,
    private weatherStore: WeatherStore,
  ) {
    super(new GraphState());
    this.manageOptions();
    this.manageData();
    logToReduxDevtoolsExtension(this.$, {
      name: 'GraphStore',
      autoPause: true,
    });
  }

  private manageOptions(): void {
    const now$ = interval(60000).pipe(
      startWith(0),
      map(() => Date.now()),
    );
    const viewRange$ = this.weatherStore('viewRange').$.pipe(
      delayOnMicrotaskQueue(),
    );
    this.subscribeTo(combineLatest([now$, viewRange$]), ([now, range]) => {
      this.updateRange(now, range);
    });
    this.subscribeTo(
      combineLatest([now$, this.locationService.$]),
      ([now, location]) => {
        this.updateAnnotations(now, location.gpsCoords);
      },
    );
  }

  private updateAnnotations(
    now: number,
    gpsCoords: GpsCoords | undefined,
  ): void {
    const nightBoxes = gpsCoords ? buildNightBoxes(now, gpsCoords) : [];
    const annotations = [...nightBoxes, buildNowLine(now)];
    this('options')('annotation' as any).assign({ annotations });
  }

  private updateRange(now: number, range: ViewRange): void {
    range = mapValues(range, (value) => now + value);
    const boundaries = buildBoundaries(now);
    this.batch(() => {
      this('options')('scales')('xAxes')(0)('ticks').assign(range);
      this('options')('plugins')('zoom')('pan').assign(boundaries);
      this('options')('plugins')('zoom')('zoom').assign(boundaries);
    });
  }

  private manageData(): void {
    this.subscribeTo(
      this.weatherStore.$.pipe(delayOnMicrotaskQueue()),
      this.updateData,
    );
  }

  private updateData(weatherState: WeatherState): void {
    this('data').set(buildDatasets(weatherState));
  }
}
