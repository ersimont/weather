import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';
import { v11Default } from 'app/upgrade/upgrade.service.fixutures';

describe('WhatsNewService', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('tracks an event when shown', async () => {
    ctx.initialState = v11Default;
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      await events.expectOne('show_whats_new', { category: 'initialization' });
    });
  });
});
