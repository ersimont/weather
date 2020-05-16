import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  buildDataSets,
  decodeLabelValues,
} from 'app/misc-components/graph/chartjs-datasets';
import {
  buildMaxRange,
  buildNightBoxes,
  buildNowLine,
  defaultChartOptions,
} from 'app/misc-components/graph/chartjs-options';
import { LocationService } from 'app/misc-services/location.service';
import { conditionInfo } from 'app/state/condition';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import * as Chart from 'chart.js';
import { ChartData, ChartOptions, ChartTooltipItem } from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import { debounce } from 'micro-dash';
import { AppStore, StoreObject } from 'ng-app-state';
import { map } from 'rxjs/operators';
import { convertTime } from 's-js-utils';
import { DirectiveSuperclass } from 's-ng-utils';
import { DeepRequired } from 'utility-types';
import { SnapRangeAction } from './snap-range-action';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  // the are only public for tests
  optionStore: StoreObject<DeepRequired<ChartOptions>>;
  dataSets$ = this.store.$.pipe(map(buildDataSets));

  private trackPan = debounce(() => {
    this.eventTrackingService.track('change_pan', 'zoom_and_pan');
  }, 5000);
  private trackZoom = debounce(() => {
    this.eventTrackingService.track('change_zoom', 'zoom_and_pan');
  }, 5000);

  constructor(
    private demicalPipe: DecimalPipe,
    private eventTrackingService: EventTrackingService,
    injector: Injector,
    private locationService: LocationService,
    ngrxStore: Store<any>,
    private store: WeatherStore,
  ) {
    super(injector);
    this.optionStore = new AppStore(
      ngrxStore,
      'Chart.js Options',
      defaultChartOptions as DeepRequired<ChartOptions>,
    );
    this.addCallbacks();
    this.snapRange(1);
    this.subscribeTo(store.action$.pipe(SnapRangeAction.filter), ({ days }) => {
      this.snapRange(days);
    });
  }

  @ViewChild('canvas')
  set canvas(canvas: ElementRef<HTMLCanvasElement>) {
    const chart = new Chart(canvas.nativeElement.getContext('2d')!, {
      type: 'line',
    });
    this.subscribeTo(this.optionStore.$, (options) => {
      chart.options = options;
      chart.update();
    });
    this.subscribeTo(this.dataSets$, (dataSets) => {
      chart.data.datasets = dataSets;
      chart.update();
    });
  }

  private addCallbacks() {
    this.optionStore('tooltips')('callbacks').assign({
      label: this.getTooltipLabel.bind(this),
      footer: this.getTooltipFooter.bind(this),
    });
    const zoomStore = this.optionStore('plugins')('zoom');
    zoomStore('pan')('onPanComplete').set((evt: any) => {
      this.setRange(evt.chart.options.scales.xAxes[0].ticks);
      this.trackPan();
    });
    zoomStore('zoom')('onZoomComplete').set((evt: any) => {
      this.setRange(evt.chart.options.scales.xAxes[0].ticks);
      this.trackZoom();
    });
  }

  private snapRange(days: number) {
    const d = new Date();
    d.setHours(d.getHours() - 1, 0, 0, 0);
    const min = d.getTime();
    this.setRange({ min, max: min + convertTime(days, 'd', 'ms') });
  }

  private setRange({ min, max }: { min: number; max: number }) {
    this.optionStore('scales')('xAxes')(0)('ticks').assign({ min, max });
    const maxRange = buildMaxRange();
    this.optionStore('plugins')('zoom')('pan').assign(maxRange);
    this.optionStore('plugins')('zoom')('zoom').assign(maxRange);

    const gpsCoords = this.locationService.getLocation().gpsCoords;
    const nightBoxes = gpsCoords ? buildNightBoxes(min, max, gpsCoords) : [];
    const annotations = [...nightBoxes, buildNowLine()];
    this.optionStore('annotation' as any).assign({ annotations });
  }

  private getTooltipLabel(item: ChartTooltipItem, data: ChartData) {
    const conditionInf = conditionInfo[decodeLabelValues(item, data).condition];
    const unitInf = conditionInf.getUnitInfo(this.store.state().units);
    const display = unitInf.getDisplay(+item.value!, this.demicalPipe);
    return `${conditionInf.label}: ${display}`;
  }

  private getTooltipFooter(items: ChartTooltipItem[], data: ChartData) {
    const sourceId = decodeLabelValues(items[0], data).sourceId;
    return `Source: ${this.store.state().sources[sourceId].label}`;
  }
}
