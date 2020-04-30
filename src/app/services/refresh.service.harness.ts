import { refreshMillis } from "app/services/refresh.service";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

export class RefreshServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  trigger() {
    this.ctx.tick(refreshMillis);
  }
}