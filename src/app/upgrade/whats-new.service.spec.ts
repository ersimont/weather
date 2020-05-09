import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { v6Default } from 'app/upgrade/upgrade.service.fixutures';

describe('WhatsNewService', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events } = ctx.harnesses);
  });

  it('tracks an event when shown', () => {
    ctx.initialState = v6Default as any;
    ctx.run(() => {
      const tracked = events.getEvents('show_whats_new');
      expect(tracked.length).toBe(1);
      expect(tracked[0].interaction).toBe(false);
    });
  });
});
