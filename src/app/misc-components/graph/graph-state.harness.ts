import { GraphStore } from 'app/misc-components/graph/graph-store';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { BoxAnnotationOptions } from 'chartjs-plugin-annotation';

export class GraphStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  getNightBoxes() {
    const state = this.ctx.inject(GraphStore).state();
    const boxAnnotations = state.options.annotation.annotations.slice(
      0,
      -1,
    ) as BoxAnnotationOptions[];
    return boxAnnotations.map((box: BoxAnnotationOptions) => ({
      from: box.xMin,
      to: box.xMax,
    }));
  }
}
