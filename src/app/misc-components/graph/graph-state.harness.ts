import { GraphStore } from 'app/misc-components/graph/graph-store';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  BoxAnnotationOptions,
  LineAnnotationOptions,
} from 'chartjs-plugin-annotation';
import { last } from 'micro-dash';

export class GraphStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  getNightBoxes() {
    const boxes = this.getAnnotations().slice(0, -1) as BoxAnnotationOptions[];
    return boxes.map((box: BoxAnnotationOptions) => ({
      from: box.xMin as number,
      to: box.xMax as number,
    }));
  }

  getNowLine() {
    const line = last(this.getAnnotations()) as LineAnnotationOptions;
    return line.value as number;
  }

  getBoundaries() {
    const state = this.ctx.inject(GraphStore).state();
    const pan = state.options.plugins.zoom.pan;
    return {
      min: pan.rangeMin.x as number,
      max: pan.rangeMax.x as number,
    };
  }

  private getAnnotations() {
    const state = this.ctx.inject(GraphStore).state();
    return state.options.annotation.annotations;
  }
}
