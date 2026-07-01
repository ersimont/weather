import { environment } from '@env';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class RefreshServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  async trigger(): Promise<void> {
    await this.ctx.tick(environment.refreshMillis);
  }
}
