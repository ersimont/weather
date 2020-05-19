import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('Climacell', () => {
  let ctx: WeatherGraphContext;
  let climacell: ClimacellHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ climacell, iq, refresh } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.CLIMACELL);
  });

  it('handles errors', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.flushReverse();
      climacell.expectHourly().flushError();

      refresh.trigger();
      iq.flushReverse();
      climacell.expectHourly();
    });
  });

  it('can cancel its request', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);

      iq.flushReverse();
      sources.toggle('Climacell');
      expect(climacell.expectHourly().isCancelled()).toBe(true);

      sources.toggle('Climacell');
      climacell.flushDefault();
    });
  });
});
