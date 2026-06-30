import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/mixpanel-core/event-tracking.service.harness';
import { v11Default } from 'app/upgrade/upgrade.service.fixutures';

describe('WhatsNewService', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('tracks an event when shown', async () => {
    ctx.initialState = v11Default;
    await ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      const tracked = events.getEvents('show_whats_new');
      expect(tracked.length).toBe(1);
    });
  });
});
