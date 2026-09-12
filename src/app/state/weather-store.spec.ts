import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';
import {
  defaultState,
  v12Default,
} from 'app/upgrade/upgrade.service.fixutures';

describe('storeProviders', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors } = ctx.harnesses);

    localStorage.removeItem('weather');
  });
  afterEach(() => {
    localStorage.removeItem('weather');
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
      const store = new WeatherStoreHarness();
      expect(await store.getPersisted()).toEqual(defaultState);
    });
  });

  it('gracefully handles an error migrating from legacy localStorage', async () => {
    ctx.useInitialState = false;
    localStorage.setItem('weather', 'not valid JSON');
    await ctx.run(async () => {
      const store = new WeatherStoreHarness();

      errors.expectGeneric();
      expect(await store.getPersisted()).toEqual(defaultState);
    });
  });
});
