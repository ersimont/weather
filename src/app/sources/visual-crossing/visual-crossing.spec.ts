import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { VisualCrossingHarness } from 'app/sources/visual-crossing/visual-crossing.harness';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('VisualCrossing', () => {
  let ctx: WeatherGraphContext;
  let crossing: VisualCrossingHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ crossing } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.VISUAL_CROSSING);
    ctx.harnesses.state.setCustomLocation();
  });

  it('handles errors', () => {
    ctx.run(() => {
      crossing.expectForecast().flushError();
      ctx.harnesses.errors.expectGeneric();

      ctx.harnesses.refresh.trigger();
      crossing.expectForecast();
    });
  });

  it('can cancel its request', () => {
    ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Visual Crossing');
      expect(crossing.expectForecast().isCancelled()).toBe(true);

      await sources.toggle('Visual Crossing');
      crossing.flushDefault();
    });
  });

  it('converts wind speed to knots', () => {
    ctx.run(() => {
      const date = 1633233600000;
      crossing.expectForecast().flush(
        crossing.buildResponse(
          {},
          {
            hour: crossing.buildHour({
              datetimeEpoch: date / 1000,
              windspeed: 1,
            }),
          },
        ),
      );
      expect(
        ctx.harnesses.store.getPersistedState().sources.visualCrossing.forecast[
          date
        ].wind,
      ).toBe(0.5399568034557235);
    });
  });
});
