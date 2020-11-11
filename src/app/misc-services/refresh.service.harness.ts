import { refreshMillis } from 'app/misc-services/refresh.service';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class RefreshServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  trigger(): void {
    this.ctx.tick(refreshMillis);
  }
}
