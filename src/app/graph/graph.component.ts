import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  LOCALE_ID,
  ViewChild,
} from '@angular/core';
import { clone, debounce } from '@s-libs/micro-dash';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { decodeLabelValues } from 'app/graph/chartjs-datasets';
import { getDefaultChartOptions } from 'app/graph/chartjs-options';
import { GraphStore } from 'app/graph/state/graph-store';
import { conditionInfo } from 'app/state/condition';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import {
  Chart,
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
    this.#eventTrackingService.track('change_pan', 'zoom_and_pan');
  }, 3000);
  #trackZoom = debounce(() => {
    this.#eventTrackingService.track('change_zoom', 'zoom_and_pan');
  }, 3000);

  #eventTrackingService = inject(EventTrackingService);
  private graphStore = inject(GraphStore);
  #injector = inject(Injector);
  #locale = inject(LOCALE_ID);
  private weatherStore = inject(WeatherStore);

  constructor() {
    super();
    this.#addCallbacks();
  }

  @ViewChild('canvas')
  set canvas(canvas: ElementRef<HTMLCanvasElement>) {
    const chart = new Chart(canvas.nativeElement, {
      type: 'line',
      options: getDefaultChartOptions(),
      data: { datasets: [] },
    });
    if (environment.paintGraph) {
      effect(
        () => {
          // chartjs mutates the stuff you give it, so give it clones
          chart.options = clone(this.graphStore('options').state);
          chart.data.datasets = clone(this.graphStore('data').state);
          chart.update();
        },
        { injector: this.#injector },
      );
    }
  }

  #addCallbacks(): void {
    const optionStore = this.graphStore('options');
    const zoomStore = optionStore('plugins')('zoom');

    optionStore('plugins')('tooltip')('callbacks').assign({
      label: this.#getTooltipLabel.bind(this),
      footer: this.#getTooltipFooter.bind(this),
    });
    zoomStore('pan')('onPanComplete').state = (evt) => {
      this.#updateRange(evt);
      this.#trackPan();
    };
    zoomStore('zoom')('onZoomComplete').state = (evt) => {
      this.#updateRange(evt);
      this.#trackZoom();
    };
  }

  #getTooltipLabel(item: TooltipItem<'line'>): string {
    const conditionInf = conditionInfo[decodeLabelValues(item).condition];
    const unitInf = conditionInf.getUnitInfo(this.weatherStore('units').state);
    const display = unitInf.getDisplay(item.parsed.y, this.#locale);
    return `${conditionInf.label}: ${display}`;
  }

  #getTooltipFooter(items: TooltipItem<'line'>[]): string {
    const sourceId = decodeLabelValues(items[0]).sourceId;
    return `Source: ${this.weatherStore('sources')(sourceId)('label').state}`;
  }

  #updateRange(evt: { chart: Chart }): void {
    const scales = evt.chart.options.scales![
      'x'
    ] as ScaleOptionsByType<'linear'>;
    const { min, max } = scales;
    const now = Date.now();
    this.weatherStore('viewRange').state = { min: min - now, max: max - now };
  }
}
