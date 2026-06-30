import { isEqual } from '@s-libs/micro-dash';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  defaultState,
  v11Default,
} from 'app/upgrade/upgrade.service.fixutures';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';

describe('UpgradeService', () => {
  let ctx: WeatherGraphContext;
  let store: WeatherStoreHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ store } = ctx.harnesses);
  });

  // This is a sanity check that will not catch any change that should necessitate an upgrade. But it will catch some.
  it('defaults to a fresh, up-to-date state', async () => {
    ctx.useInitialState = false;
    await ctx.run(async () => {
      const actual = store.getPersistedState();

      expect(
        actual,
        'Default state changed. You need to handle it in the upgrade service. Check the console for what was in the store.',
      ).toEqual(defaultState);
      if (!isEqual(actual, defaultState)) {
        console.log(actual);
      }
      expect(await ctx.getAllHarnesses(WhatsNewComponentHarness)).toEqual([]);

      await ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v11', async () => {
    ctx.initialState = v11Default;
    await ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'Tomorrow.io is no longer available.',
      ]);

      await ctx.cleanUpFreshInit();
    });
  });
});
