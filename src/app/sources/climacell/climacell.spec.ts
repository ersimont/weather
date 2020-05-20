import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { SourceId } from 'app/state/source';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('Climacell', () => {
  let ctx: WeatherGraphContext;
  let climacell: ClimacellHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ climacell, refresh, state } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.CLIMACELL);
  });

  it('handles errors', () => {
    state.setCustomLocation();
    ctx.run(() => {
      climacell.expectHourly().flushError();

      refresh.trigger();
      climacell.expectHourly();
    });
  });

  it('can cancel its request', () => {
    state.setCustomLocation();
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);
      sources.toggle('Climacell');
      expect(climacell.expectHourly().isCancelled()).toBe(true);

      sources.toggle('Climacell');
      climacell.flushDefault();
    });
  });
});
