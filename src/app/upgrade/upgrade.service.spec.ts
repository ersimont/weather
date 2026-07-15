import { isEqual } from '@s-libs/micro-dash';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  defaultState,
  v11Default,
  v12Default,
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

      if (!isEqual(actual, defaultState)) {
        console.log(actual);
        expect.fail(
          'Default state changed. You need to handle it in the upgrade service. Check the console for what was in the store.',
        );
      }
      expect(await ctx.getAllHarnesses(WhatsNewComponentHarness)).toEqual([]);
    });
  });

  it('upgrades from v12', async () => {
    ctx.initialState = v12Default;
    await ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      console.log(await whatsNew.getFeatures());
      expect(await whatsNew.getFeatures()).toContain(
        'Weather Unlocked is no longer available. They shut down their API.',
      );
    });
  });

  it('upgrades from v11', async () => {
    ctx.initialState = v11Default;
    await ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      console.log(await whatsNew.getFeatures());
      expect(await whatsNew.getFeatures()).toContain(
        'Tomorrow.io is no longer available.',
      );
    });
  });
});
