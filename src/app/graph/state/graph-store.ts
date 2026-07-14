import { inject, Service } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { mapToObject } from '@s-libs/js-core';
import { mapValues } from '@s-libs/micro-dash';
import { mixInInjectableSuperclass } from '@s-libs/ng-core';
import { delayOnMicrotaskQueue } from '@s-libs/rxjs-core';
import { RootStore, Store } from '@s-libs/signal-store';
import { buildDatasets } from 'app/graph/chartjs-datasets';
import {
  buildLightBoxes,
  buildNowLine,
  getMinMax,
} from 'app/graph/chartjs-options';
import { GraphState } from 'app/graph/state/graph-state';
import { LocationService } from 'app/misc-services/location.service';
import { Condition } from 'app/state/condition';
import { GpsCoords, Location } from 'app/state/location';
import { ViewRange } from 'app/state/view-range';
import { WeatherStore } from 'app/state/weather-store';
import { observeStore } from 'app/to-replace/signal-store/observe-store';
import { combineLatest, interval } from 'rxjs';
import { filter, map, startWith, take } from 'rxjs/operators';

@Service()
export class GraphStore extends mixInInjectableSuperclass(
  RootStore,
)<GraphState> {
  #locationService = inject(LocationService);
  #weatherStore = inject(WeatherStore);

  constructor() {
    super(new GraphState());
    this.#manageOptions();
    this.#manageData();
  }

  #manageOptions(): void {
    const now$ = interval(60_000).pipe(startWith(0), map(Date.now));

    const viewRange$ = observeStore(this.#weatherStore('viewRange'));
    this.subscribeTo(
      combineLatest([now$, viewRange$]).pipe(delayOnMicrotaskQueue()),
      ([now, range]) => {
        this.#updateRange(now, range);
      },
    );

    const location$ = toObservable(this.#locationService.location);
    this.subscribeTo(
      combineLatest([now$, location$]).pipe(delayOnMicrotaskQueue()),
      ([now, location]) => {
        this.#updateAnnotations(now, location.gpsCoords);
      },
    );
    this.subscribeTo(
      location$.pipe(delayOnMicrotaskQueue()),
      this.#updateTimezone,
    );
  }

  #updateRange(now: number, range: ViewRange): void {
    range = mapValues(range, (value) => now + value);
    this('options')('scales')('x').nonNull.assign(range);
    this('options')('plugins')('zoom')('limits')('x').nonNull.assign(
      getMinMax(now),
    );
  }

  #updateAnnotations(now: number, gpsCoords: GpsCoords | undefined): void {
    const nightBoxes = gpsCoords ? buildLightBoxes(now, gpsCoords) : [];
    const annotations = [...nightBoxes, buildNowLine(now)];
    this('options')('plugins')('annotation').nonNull.assign({ annotations });
  }

  #updateTimezone({ timezone }: Location): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const scaleStore = this('options')('scales')('x') as Store<any>;
    const adapterStore = scaleStore('adapters')('date');
    adapterStore('zone').nonNull.state = timezone;
  }

  #manageData(): void {
    const colors$ = interval(100).pipe(
      startWith(0),
      map(getColors),
      filter((colors) => !!colors[Condition.AMOUNT]),
      take(1),
    );
    this.subscribeTo(
      combineLatest([observeStore(this.#weatherStore), colors$]).pipe(
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return mapToObject(Condition, (condition: Condition) => [
    condition,
    bodyStyles.getPropertyValue(`--${condition}`),
  ]) as Record<Condition, string>;
}
