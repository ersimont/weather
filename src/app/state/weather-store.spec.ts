import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('WeatherStore', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let iq: LocationIqServiceHarness;
  let store: WeatherStoreHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, iq, store } = ctx.harnesses);
  });

  it('persists state changes', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(() => {
      iq.expectReverse();

      ctx.getHarness(LocationOptionsComponentHarness).select('Custom');
      expect(store.getPersistedState().useCurrentLocation).toBe(false);
    });
  });

  it('tracks an event when initializing a fresh state', () => {
    ctx.run({ useInitialState: false }, () => {
      const tracked = events.getEvents('initialize_fresh_state');
      expect(tracked.length).toBe(1);
      expect(tracked[0].interaction).toBe(false);

      ctx.cleanUpFreshInit();
    });
  });

  it('does not track an event if there is saved state', () => {
    ctx.run({ useInitialState: true }, () => {
      ctx.cleanUpFreshInit();

      expect(events.getEvents('initialize_fresh_state').length).toBe(0);
    });
  });
});
