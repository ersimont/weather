import { inject, Injectable } from '@angular/core';
import { mapToObject } from '@s-libs/js-core';
import { mapValues } from '@s-libs/micro-dash';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import { delayOnMicrotaskQueue } from '@s-libs/rxjs-core';
import { RootStore, Store } from '@s-libs/signal-store';
import { buildDatasets } from 'app/graph/chartjs-datasets';
import {
  buildNightBoxes,
  buildNowLine,
  getMinMax,
} from 'app/graph/chartjs-options';
import { GraphState } from 'app/graph/state/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { Condition } from 'app/state/condition';
import { GpsCoords, Location } from 'app/state/location';
import { ViewRange } from 'app/state/viewRange';
import { WeatherStore } from 'app/state/weather-store';
import { logToReduxDevtoolsExtension } from 'app/to-replace/js-core/redux/log-to-redux-devtools-extension';
import { toState$ } from 'app/to-replace/signal-store/to-state';
import { TimeScaleOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { combineLatest, interval } from 'rxjs';
import { filter, map, startWith, take } from 'rxjs/operators';
import { DeepRequired } from 'utility-types';

@Injectable()
export class GraphStore extends mixInInjectableSuperclass(
  RootStore,
)<GraphState> {
  #locationService = inject(LocationService);
  private weatherStore = inject(WeatherStore);

  constructor() {
    super(new GraphState());
    this.#manageOptions();
    this.#manageData();

    logToReduxDevtoolsExtension(() => this.state, {
      name: 'GraphStore',
      autoPause: true,
    });
  }

  #manageOptions(): void {
    const now$ = interval(60_000).pipe(startWith(0), map(Date.now));
    const viewRange$ = toState$(this.weatherStore('viewRange'));
    this.subscribeTo(
      combineLatest([now$, viewRange$]).pipe(delayOnMicrotaskQueue()),
      ([now, range]) => {
        this.#updateRange(now, range);
      },
    );
    this.subscribeTo(
      combineLatest([now$, this.#locationService.$]).pipe(
        delayOnMicrotaskQueue(),
      ),
      ([now, location]) => {
        this.#updateAnnotations(now, location.gpsCoords);
      },
    );
    this.subscribeTo(
      this.#locationService.$.pipe(delayOnMicrotaskQueue()),
      this.#updateTimezone,
    );
  }

  #updateAnnotations(now: number, gpsCoords: GpsCoords | undefined): void {
    const nightBoxes = gpsCoords ? buildNightBoxes(now, gpsCoords) : [];
    const annotations = [...nightBoxes, buildNowLine(now)] as DeepRequired<
      AnnotationOptions[]
    >;
    this('options')('plugins')('annotation').assign({ annotations });
  }

  #updateRange(now: number, range: ViewRange): void {
    range = mapValues(range, (value) => now + value);
    this('options')('scales')('x').assign(range);
    this('options')('plugins')('zoom')('limits')('x').assign(getMinMax(now));
  }

  #updateTimezone({ timezone }: Location): void {
    const scaleStore = this('options')('scales')(
      'x',
    ) as Store<TimeScaleOptions>;
    const adapterStore = scaleStore('adapters')('date') as Store<any>;
    adapterStore('zone').state = timezone;
  }

  #manageData(): void {
    const colors$ = interval(100).pipe(
      startWith(0),
      map(getColors),
      filter((colors) => !!colors[Condition.AMOUNT]),
      take(1),
    );
    this.subscribeTo(
      combineLatest([toState$(this.weatherStore), colors$]).pipe(
        delayOnMicrotaskQueue(),
      ),
      ([weatherState, colors]) => {
        this('data').state = buildDatasets(weatherState, colors);
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
