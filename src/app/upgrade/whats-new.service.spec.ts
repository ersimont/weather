import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/mixpanel-core/event-tracking.service.harness';
import { v6Default } from 'app/upgrade/upgrade.service.fixutures';

describe('WhatsNewService', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq } = ctx.harnesses);
  });

  it('tracks an event when shown', () => {
    ctx.initialState = v6Default;
    ctx.run(() => {
      const events = new EventTrackingServiceHarness();
      const tracked = events.getEvents('show_whats_new');
      expect(tracked.length).toBe(1);

      iq.expectReverse();
    });
  });
});
