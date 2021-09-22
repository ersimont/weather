import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { TomorrowIoHarness } from 'app/sources/tomorrow-io/tomorrow-io-harness';
import { SourceId } from 'app/state/source';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('TomorrowIo', () => {
  let ctx: WeatherGraphContext;
  let tomorrowIo: TomorrowIoHarness;
  let errors: SnackBarErrorServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ tomorrowIo, errors, refresh, state } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.TOMORROW_IO);
  });

  it('handles errors', () => {
    state.setCustomLocation();
    ctx.run(() => {
      tomorrowIo.expectTimelines().flushError();
      errors.expectGeneric();

      refresh.trigger();
      tomorrowIo.expectTimelines();
    });
  });

  it('can cancel its request', () => {
    state.setCustomLocation();
    ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Tomorrow.io');
      expect(tomorrowIo.expectTimelines().isCancelled()).toBe(true);

      await sources.toggle('Tomorrow.io');
      tomorrowIo.flushDefault();
    });
  });
});
