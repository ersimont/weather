import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';
import {
  defaultState,
  v10Default,
  v5Example,
  v6Default,
  v7Default,
  v8Default,
  v9Default,
} from 'app/upgrade/upgrade.service.fixutures';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';

describe('UpgradeService', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  let iq: LocationIqServiceHarness;
  let store: WeatherStoreHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, iq, store } = ctx.harnesses);
  });

  // This is a sanity check that will not catch any change that should necessitate an upgrade. But it will catch some.
  it('defaults to a fresh, up-to-date state', () => {
    ctx.useInitialState = false;
    ctx.run(async () => {
      expect(store.getPersistedState())
        .withContext(
          'Default state changed. You need to handle it in the upgrade service.',
        )
        .toEqual(defaultState);
      expect(await ctx.getAllHarnesses(WhatsNewComponentHarness)).toEqual([]);
      // console.log(store.getPersistedState());

      await ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v10', () => {
    ctx.initialState = v10Default as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
      ]);

      await ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v9', () => {
    ctx.initialState = v9Default as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
        'Climacell changed its name to Tomorrow.io',
      ]);

      await ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v8', () => {
    ctx.initialState = v8Default as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
        'Climacell changed its name to Tomorrow.io',
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
      ]);

      await ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v7', () => {
    ctx.initialState = v7Default as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
        'Climacell changed its name to Tomorrow.io',
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
      ]);

      await ctx.cleanUpFreshInit();
    });
  });

  it("upgrades from v6, showing what's new", () => {
    ctx.initialState = v6Default as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual({
        ...defaultState,
        useCurrentLocation: true,
      });
      const whatsNew = await ctx.getHarness(WhatsNewComponentHarness);
      expect(await whatsNew.getFeatures()).toEqual([
        'You can get your forecast from Visual Crossing. Check it out in the Sources section of the settings.',
        'Climacell changed its name to Tomorrow.io',
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
        'You can get your forecast from Tomorrow.io. Check it out in the Sources section of the settings.',
      ]);

      iq.expectReverse();
    });
  });

  it('uses a fresh state from v5, logging an error', () => {
    ctx.initialState = v5Example as any;
    ctx.run(async () => {
      expect(store.getPersistedState()).toEqual(defaultState);
      expect(await ctx.getAllHarnesses(WhatsNewComponentHarness)).toEqual([]);
      errors.expectGeneric();

      await ctx.cleanUpFreshInit();
    });
  });
});
