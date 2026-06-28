import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class GraphStoreHarness {
  constructor(private ctx: WeatherGraphContext) {}

  async triggerAnnotationUpdate(): Promise<void> {
    await this.ctx.tick(60000);
  }
}
