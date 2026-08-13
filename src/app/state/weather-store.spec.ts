import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';
import {
  defaultState,
  v12Default,
} from 'app/upgrade/upgrade.service.fixutures';

describe('storeProviders', () => {
  let ctx: WeatherGraphContext;
  let store: WeatherStoreHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ store } = ctx.harnesses);
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

  it('migrates from the legacy localStorage', async () => {
    ctx.useInitialState = false;
    localStorage.setItem('weather', JSON.stringify(v12Default));
    await ctx.run(async () => {
      expect(await store.getPersistedState()).toEqual(defaultState);
    });
    localStorage.removeItem('weather');
  });
});
