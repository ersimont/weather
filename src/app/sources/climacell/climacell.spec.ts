import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { SourceId } from 'app/state/source';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('Climacell', () => {
  let ctx: WeatherGraphContext;
  let climacell: ClimacellHarness;
  let errors: SnackBarErrorServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ climacell, errors, refresh, state } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.CLIMACELL);
  });

  it('handles errors', () => {
    state.setCustomLocation();
    ctx.run(() => {
      climacell.expectHourly().flushError();
      errors.expectGeneric();

      refresh.trigger();
      climacell.expectHourly();
    });
  });

  it('can cancel its request', () => {
    state.setCustomLocation();
    ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Climacell');
      expect(climacell.expectHourly().isCancelled()).toBe(true);

      await sources.toggle('Climacell');
      climacell.flushDefault();
    });
  });
});
