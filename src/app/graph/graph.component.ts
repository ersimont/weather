import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
} from '@angular/core';
import { decodeLabelValues } from 'app/graph/chartjs-datasets';
import { GraphStore } from 'app/graph/state/graph-store';
import { LocationService } from 'app/misc-services/location.service';
import { conditionInfo } from 'app/state/condition';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import * as Chart from 'chart.js';
import { ChartData, ChartOptions, ChartTooltipItem } from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import { clone, debounce } from '@s-libs/micro-dash';
import * as moment from 'moment';
import 'moment-timezone';
import { assert } from '@s-libs/js-core';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { environment } from '../../environments/environment';

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
    private graphStore: GraphStore,
    injector: Injector,
    locationService: LocationService,
    private weatherStore: WeatherStore,
  ) {
    super(injector);
    this.addCallbacks();
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
    const ctx = canvas.nativeElement.getContext('2d');
    assert(ctx, 'no 2d context available');
    const chart = new Chart(ctx, { type: 'line' });
    if (environment.paintGraph) {
      this.subscribeTo(this.graphStore.$, (graphState) => {
        chart.options = graphState.options as ChartOptions;
        chart.data.datasets = graphState.data.map(clone);
        chart.update();
      });
    }
  }

  private addCallbacks(): void {
    const optionStore = this.graphStore('options');
    const zoomStore = optionStore('plugins')('zoom');

    optionStore('tooltips')('callbacks').assign({
      label: this.getTooltipLabel.bind(this),
      footer: this.getTooltipFooter.bind(this),
    });
    zoomStore('pan')('onPanComplete').set((evt: any) => {
      this.updateRange(evt);
      this.trackPan();
    });
    zoomStore('zoom')('onZoomComplete').set((evt: any) => {
      this.updateRange(evt);
      this.trackZoom();
    });
  }

  private getTooltipLabel(item: ChartTooltipItem, data: ChartData): string {
    const conditionInf = conditionInfo[decodeLabelValues(item, data).condition];
    const unitInf = conditionInf.getUnitInfo(this.weatherStore.state().units);
    const display = unitInf.getDisplay(+item.value!, this.demicalPipe);
    return `${conditionInf.label}: ${display}`;
  }

  private getTooltipFooter(items: ChartTooltipItem[], data: ChartData): string {
    const sourceId = decodeLabelValues(items[0], data).sourceId;
    return `Source: ${this.weatherStore.state().sources[sourceId].label}`;
  }

  private updateRange(evt: any): void {
    const { min, max } = evt.chart.options.scales.xAxes[0].ticks;
    const now = Date.now();
    this.weatherStore('viewRange').set({ min: min - now, max: max - now });
  }
}
