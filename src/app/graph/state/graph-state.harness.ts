import { last } from '@s-libs/micro-dash';
import { GraphStore } from 'app/graph/state/graph-store';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { ChartOptions } from 'chart.js';
import {
  AnnotationOptions,
  BoxAnnotationOptions,
  LineAnnotationOptions,
} from 'chartjs-plugin-annotation';
import { DeepRequired } from 'utility-types';

export class GraphStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  getRange(): [number, number] {
    const scale = this.#getOptions().scales['x'];
    return [+scale.min, +scale.max];
  }

  getNightBoxes(): number[][] {
    const boxes = this.#getAnnotations().slice(0, -1) as BoxAnnotationOptions[];
    return boxes.map((box: BoxAnnotationOptions) => [
      box.xMin as number,
      box.xMax as number,
    ]);
  }

  getNowLine(): number {
    const line = last(this.#getAnnotations()) as LineAnnotationOptions;
    return line.xMax as number;
  }

  getBoundaries(): number[] {
    const limit = this.#getOptions().plugins.zoom.limits['x'];
    return [limit.min as number, limit.max as number];
  }

  #getAnnotations(): AnnotationOptions[] {
    return this.#getOptions().plugins.annotation
      .annotations as AnnotationOptions[];
  }

  #getOptions(): DeepRequired<ChartOptions<'line'>> {
    return this.ctx.inject(GraphStore)('options').state as DeepRequired<
      ChartOptions<'line'>
    >;
  }
}
