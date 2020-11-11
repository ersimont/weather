import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class GraphStoreHarness {
  constructor(private ctx: WeatherGraphContext) {}

  triggerAnnotationUpdate(): void {
    this.ctx.tick(60000);
  }
}
