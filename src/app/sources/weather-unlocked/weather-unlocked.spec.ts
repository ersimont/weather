import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('WeatherUnlocked', () => {
  let ctx: WeatherGraphContext;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ unlocked } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.WEATHER_UNLOCKED);
  });

  it('can cancel its request', () => {
    ctx.harnesses.state.setCustomLocation();
    ctx.run(async () => {
      const sources = await ctx.getHarness(SourceOptionsComponentHarness);
      await sources.toggle('Weather Unlocked');
      expect(unlocked.expectForecast().isCancelled()).toBe(true);

      await sources.toggle('Weather Unlocked');
      unlocked.flushDefault();
    });
  });

  it('rounds gps coordinates to 3 decimal places', () => {
    ctx.harnesses.state.setCustomLocation([12.3456, 65.4321]);
    ctx.run(() => {
      unlocked.expectForecast([12.346, 65.432]);
    });
  });
});
