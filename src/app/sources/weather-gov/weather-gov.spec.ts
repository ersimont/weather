import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('WeatherGov', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  let gov: WeatherGovHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, gov, refresh, state } = ctx.harnesses);
  });

  it('can cancel the first request', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Weather.gov');
      expect(gov.expectPoints().isCancelled()).toBe(true);

      await sources.toggle('Weather.gov');
      await gov.flushFixture();
    });
  });

  it('can cancel the second request', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await gov.expectPoints().flush(pointResponse);
      await sources.toggle('Weather.gov');
      expect(gov.expectGrid().isCancelled()).toBe(true);

      await sources.toggle('Weather.gov');
      await gov.flushFixture();
    });
  });

  it('does not prevent refreshes after error', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      await gov.expectPoints().flushError();
      errors.expectGeneric();

      await refresh.trigger();
      await gov.expectPoints().flush(pointResponse);
      await gov.expectGrid().flushError();
      errors.expectGeneric();

      await refresh.trigger();
      await gov.flushFixture();
    });
  });

  it('rounds gps coordinates to 4 decimal places', async () => {
    state.setCustomLocation([12.34567, 76.54321]);
    await ctx.run(() => {
      gov.expectPoints([12.3457, 76.5432]);
    });
  });
});
