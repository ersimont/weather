import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { OpenMateoHarness } from 'app/sources/open-mateo/open-mateo.harness';
import { SourceId } from 'app/state/source';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('OpenMateo', () => {
  let ctx: WeatherGraphContext;
  let mateo: OpenMateoHarness;
  let errors: SnackBarErrorServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, mateo, refresh, state } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.OPEN_MATEO);
  });

  it('handles errors', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      await mateo.expectForecast().flushError();
      errors.expectGeneric();

      await refresh.trigger();
      mateo.expectForecast();
    });
  });

  it('can cancel its request', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Open-Mateo');
      expect(mateo.expectForecast().isCancelled()).toBe(true);

      await sources.toggle('Open-Mateo');
      await mateo.flushDefault();
    });
  });
});
