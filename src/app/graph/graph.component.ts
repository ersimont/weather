import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Injector,
  LOCALE_ID,
  ViewChild,
} from '@angular/core';
import { clone, debounce } from '@s-libs/micro-dash';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { decodeLabelValues } from 'app/graph/chartjs-datasets';
import { defaultChartOptions } from 'app/graph/chartjs-options';
import { GraphStore } from 'app/graph/state/graph-store';
import { conditionInfo } from 'app/state/condition';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import {
  Chart,
  ChartOptions,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScaleOptionsByType,
  TimeScale,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import 'chartjs-adapter-luxon';
import Annotation from 'chartjs-plugin-annotation';
import Zoom from 'chartjs-plugin-zoom';
import { environment } from '../../environments/environment';

Chart.register(
  LineElement,
  PointElement,
  LineController,
  LinearScale,
  TimeScale,
  Filler,
  Tooltip,
  Annotation,
  Zoom,
);

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GraphComponent extends DirectiveSuperclass {
  #trackPan = debounce(() => {
    this.eventTrackingService.track('change_pan', 'zoom_and_pan');
  }, 3000);
  #trackZoom = debounce(() => {
    this.eventTrackingService.track('change_zoom', 'zoom_and_pan');
  }, 3000);

  constructor(
    private eventTrackingService: EventTrackingService,
    private graphStore: GraphStore,
    injector: Injector,
    @Inject(LOCALE_ID) private locale: string,
    private weatherStore: WeatherStore,
  ) {
    super(injector);
    this.#addCallbacks();
  }

  @ViewChild('canvas')
  set canvas(canvas: ElementRef<HTMLCanvasElement>) {
    const chart = new Chart(canvas.nativeElement, {
      type: 'line',
      options: defaultChartOptions,
      data: { datasets: [] },
    });
    if (environment.paintGraph) {
      this.subscribeTo(this.graphStore.$, (graphState) => {
        chart.options = graphState.options as ChartOptions<'line'>;
        chart.data.datasets = graphState.data.map(clone);
        // This setTimeout was suddenly needed after upgrading to chart.js 3. The setRange buttons would lag 1 behind what you clicked.
        setTimeout(() => chart.update());
      });
    }
  }

  #addCallbacks(): void {
    const optionStore = this.graphStore('options');
    const zoomStore = optionStore('plugins')('zoom');

    optionStore('plugins')('tooltip')('callbacks').assign({
      label: this.#getTooltipLabel.bind(this),
      footer: this.#getTooltipFooter.bind(this),
    });
    zoomStore('pan')('onPanComplete').set((evt) => {
      this.#updateRange(evt);
      this.#trackPan();
    });
    zoomStore('zoom')('onZoomComplete').set((evt) => {
      this.#updateRange(evt);
      this.#trackZoom();
    });
  }

  #getTooltipLabel(item: TooltipItem<'line'>): string {
    const conditionInf = conditionInfo[decodeLabelValues(item).condition];
    const unitInf = conditionInf.getUnitInfo(this.weatherStore.state().units);
    const display = unitInf.getDisplay(item.parsed.y, this.locale);
    return `${conditionInf.label}: ${display}`;
  }

  #getTooltipFooter(items: TooltipItem<'line'>[]): string {
    const sourceId = decodeLabelValues(items[0]).sourceId;
    return `Source: ${this.weatherStore.state().sources[sourceId].label}`;
  }

  #updateRange(evt: { chart: Chart }): void {
    const scales = evt.chart.options.scales![
      'x'
    ] as ScaleOptionsByType<'linear'>;
    const { min, max } = scales;
    const now = Date.now();
    this.weatherStore('viewRange').set({ min: min - now, max: max - now });
  }
}
