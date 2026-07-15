import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';

describe('WeatherStore', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let store: WeatherStoreHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, store } = ctx.harnesses);
  });

  it('persists state changes', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      await location.select('Custom');
      expect(store.getPersistedState().useCurrentLocation).toBe(false);
    });
  });

  it('tracks an event when initializing a fresh state', async () => {
    ctx.useInitialState = false;
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      await events.expectOne('initialize_fresh_state', {
        category: 'initialization',
      });
    });
  });

  it('does not track an event if there is saved state', async () => {
    ctx.useInitialState = true;
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      await events.expectNone('initialize_fresh_state');
    });
  });
});
