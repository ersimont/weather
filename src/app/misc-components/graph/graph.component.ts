import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
} from '@angular/core';
import { decodeLabelValues } from 'app/misc-components/graph/chartjs-datasets';
import { buildMaxRange } from 'app/misc-components/graph/chartjs-options';
import { GraphStore } from 'app/misc-components/graph/graph-store';
import { LocationService } from 'app/misc-services/location.service';
import { conditionInfo } from 'app/state/condition';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import * as Chart from 'chart.js';
import { ChartData, ChartTooltipItem } from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import { clone, debounce } from 'micro-dash';
import * as moment from 'moment';
import 'moment-timezone';
import { convertTime } from 's-js-utils';
import { DirectiveSuperclass } from 's-ng-utils';
import { SnapRangeAction } from './snap-range-action';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  private trackPan = debounce(() => {
    this.eventTrackingService.track('change_pan', 'zoom_and_pan');
  }, 5000);
  private trackZoom = debounce(() => {
    this.eventTrackingService.track('change_zoom', 'zoom_and_pan');
  }, 5000);

  constructor(
    private demicalPipe: DecimalPipe,
    private eventTrackingService: EventTrackingService,
    public graphStore: GraphStore, // public for tests
    injector: Injector,
    locationService: LocationService,
    private weatherStore: WeatherStore,
  ) {
    super(injector);
    this.addCallbacks();
    this.snapRange(1);
    this.subscribeTo(
      weatherStore.action$.pipe(SnapRangeAction.filter),
      ({ days }) => {
        this.snapRange(days);
      },
    );
    this.subscribeTo(locationService.$, (location) => {
      if (location.timezone) {
        moment.tz.setDefault(location.timezone);
      } else {
        moment.tz.setDefault();
      }
    });
  }

  @ViewChild('canvas')
  set canvas(canvas: ElementRef<HTMLCanvasElement>) {
    const ctx = canvas.nativeElement.getContext('2d')!;
    const chart = new Chart(ctx, { type: 'line' });
    this.subscribeTo(this.graphStore.$, (graphState) => {
      chart.options = graphState.options;
      chart.data.datasets = graphState.data.map(clone);
      chart.update();
    });
  }

  private addCallbacks() {
    const optionStore = this.graphStore('options');
    const zoomStore = optionStore('plugins')('zoom');

    optionStore('tooltips')('callbacks').assign({
      label: this.getTooltipLabel.bind(this),
      footer: this.getTooltipFooter.bind(this),
    });
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

  private setRange(range: { min: number; max: number }) {
    this.graphStore('options')('scales')('xAxes')(0)('ticks').assign(range);

    // TODO: move to some date observable
    const maxRange = buildMaxRange();
    this.graphStore('options')('plugins')('zoom').batch((batch) => {
      batch('pan').assign(maxRange);
      batch('zoom').assign(maxRange);
    });
  }

  private getTooltipLabel(item: ChartTooltipItem, data: ChartData) {
    const conditionInf = conditionInfo[decodeLabelValues(item, data).condition];
    const unitInf = conditionInf.getUnitInfo(this.weatherStore.state().units);
    const display = unitInf.getDisplay(+item.value!, this.demicalPipe);
    return `${conditionInf.label}: ${display}`;
  }

  private getTooltipFooter(items: ChartTooltipItem[], data: ChartData) {
    const sourceId = decodeLabelValues(items[0], data).sourceId;
    return `Source: ${this.weatherStore.state().sources[sourceId].label}`;
  }
}
