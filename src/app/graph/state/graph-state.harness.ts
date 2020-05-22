import { GraphStore } from 'app/graph/state/graph-store';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  BoxAnnotationOptions,
  LineAnnotationOptions,
} from 'chartjs-plugin-annotation';
import { last } from 'micro-dash';

export class GraphStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  getRange(): [number, number] {
    const ticks = this.getState().options.scales.xAxes[0].ticks;
    return [ticks.min, ticks.max];
  }

  getNightBoxes() {
    const boxes = this.getAnnotations().slice(0, -1) as BoxAnnotationOptions[];
    return boxes.map((box: BoxAnnotationOptions) => [
      box.xMin as number,
      box.xMax as number,
    ]);
  }

  getNowLine() {
    const line = last(this.getAnnotations()) as LineAnnotationOptions;
    return line.value as number;
  }

  getBoundaries() {
    const pan = this.getState().options.plugins.zoom.pan;
    return [pan.rangeMin.x as number, pan.rangeMax.x as number];
  }

  private getAnnotations() {
    return this.getState().options.annotation.annotations;
  }

  private getState() {
    return this.ctx.inject(GraphStore).state();
  }
}
