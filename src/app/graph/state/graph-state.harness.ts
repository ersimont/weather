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
    const ticks = this.getState().options.scales.xAxes[0].ticks;
    return [ticks.min, ticks.max];
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
    return line.value as number;
  }

  getBoundaries(): number[] {
    const pan = this.getState().options.plugins['zoom'].pan;
    return [pan.rangeMin.x as number, pan.rangeMax.x as number];
  }

  private getAnnotations(): AnnotationOptions[] {
    return this.getState().options.annotation.annotations as any;
  }

  private getState(): GraphState {
    return this.ctx.inject(GraphStore).state();
  }
}
