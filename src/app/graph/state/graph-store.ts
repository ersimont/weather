import { Injectable } from '@angular/core';
import { RootStore } from '@s-libs/app-state';
import { mapToObject } from '@s-libs/js-core';
import { mapValues } from '@s-libs/micro-dash';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import {
  delayOnMicrotaskQueue,
  logToReduxDevtoolsExtension,
} from '@s-libs/rxjs-core';
import { buildDatasets } from 'app/graph/chartjs-datasets';
import {
  buildNightBoxes,
  buildNowLine,
  getMinMax,
} from 'app/graph/chartjs-options';
import { GraphState } from 'app/graph/state/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { Condition } from 'app/state/condition';
import { GpsCoords } from 'app/state/location';
import { ViewRange } from 'app/state/viewRange';
import { WeatherStore } from 'app/state/weather-store';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { combineLatest, interval } from 'rxjs';
import { filter, map, startWith, take } from 'rxjs/operators';
import { DeepRequired } from 'utility-types';

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
    const annotations = [...nightBoxes, buildNowLine(now)] as DeepRequired<
      AnnotationOptions[]
    >;
    this('options')('plugins')('annotation').assign({ annotations });
  }

  private updateRange(now: number, range: ViewRange): void {
    range = mapValues(range, (value) => now + value);
    this.batch(() => {
      this('options')('scales')('x').assign(range);
      this('options')('plugins')('zoom')('limits')('x').assign(getMinMax(now));
    });
  }

  private manageData(): void {
    const colors$ = interval(100).pipe(
      startWith(0),
      map(getColors),
      filter((colors) => !!colors[Condition.AMOUNT]),
      take(1),
    );
    this.subscribeTo(
      combineLatest([this.weatherStore.$, colors$]),
      ([weatherState, colors]) => {
        this('data').set(buildDatasets(weatherState, colors));
      },
    );
  }
}

function getColors(): Record<Condition, string> {
  const bodyStyles = getComputedStyle(document.body);
  return mapToObject(Condition, (condition: Condition) => [
    condition,
    bodyStyles.getPropertyValue(`--${condition}`),
  ]) as Record<Condition, string>;
}
