import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';
import {
  defaultState,
  v5Example,
  v6Default,
  v7Default,
  v8Default,
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
    ctx.run({ useInitialState: false }, () => {
      expect(store.getPersistedState())
        .withContext(
          'Default state changed. You need to handle it in the upgrade service.',
        )
        .toEqual(defaultState);
      expect(ctx.getHarnessForOptional(WhatsNewComponentHarness)).toBe(null);

      ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v8', () => {
    ctx.initialState = v8Default as any;
    ctx.run(() => {
      expect(store.getPersistedState()).toEqual(defaultState);
      expect(ctx.getHarness(WhatsNewComponentHarness).getFeatures()).toEqual([
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
      ]);

      ctx.cleanUpFreshInit();
    });
  });

  it('upgrades from v7', () => {
    ctx.initialState = v7Default as any;
    ctx.run(() => {
      expect(store.getPersistedState()).toEqual(defaultState);
      expect(ctx.getHarness(WhatsNewComponentHarness).getFeatures()).toEqual([
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
      ]);

      ctx.cleanUpFreshInit();
    });
  });

  it("upgrades from v6, showing what's new", () => {
    ctx.initialState = v6Default as any;
    ctx.run(() => {
      expect(store.getPersistedState()).toEqual({
        ...defaultState,
        useCurrentLocation: true,
      });
      expect(ctx.getHarness(WhatsNewComponentHarness).getFeatures()).toEqual([
        'You can get your forecast from OpenWeather. Check it out in the Sources section of the settings.',
        'You can get your forecast from Climacell. Check it out in the Sources section of the settings.',
      ]);

      iq.expectReverse();
    });
  });

  it('uses a fresh state from v5, logging an error', () => {
    ctx.initialState = v5Example as any;
    ctx.run(() => {
      expect(store.getPersistedState()).toEqual(defaultState);
      expect(ctx.getHarnessForOptional(WhatsNewComponentHarness)).toBe(null);
      errors.expectGeneric();

      ctx.cleanUpFreshInit();
    });
  });
});
