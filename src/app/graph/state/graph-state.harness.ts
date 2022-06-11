import { GraphState } from 'app/graph/state/graph-state';
import { GraphStore } from 'app/graph/state/graph-store';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  AnnotationOptions,
  BoxAnnotationOptions,
  LineAnnotationOptions,
} from 'chartjs-plugin-annotation';
import { last } from '@s-libs/micro-dash';

export class GraphStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  getRange(): [number, number] {
    const scale = this.getState().options.scales['x'];
    return [+scale.min, +scale.max];
  }

  getNightBoxes(): number[][] {
    const boxes = this.getAnnotations().slice(0, -1) as BoxAnnotationOptions[];
    return boxes.map((box: BoxAnnotationOptions) => [
      box.xMin as number,
      box.xMax as number,
    ]);
  }

  getNowLine(): number {
    const line = last(this.getAnnotations()) as LineAnnotationOptions;
    return line.xMax as number;
  }

  getBoundaries(): number[] {
    const limit = this.getState().options.plugins.zoom.limits['x'];
    return [limit.min as number, limit.max as number];
  }

  private getAnnotations(): AnnotationOptions[] {
    return this.getState().options.plugins.annotation
      .annotations as AnnotationOptions[];
  }

  private getState(): GraphState {
    return this.ctx.inject(GraphStore).state();
  }
}
