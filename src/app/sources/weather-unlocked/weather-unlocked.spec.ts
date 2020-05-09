import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('WeatherUnlocked', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let sources: SourceOptionsComponentHarness;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, sources, unlocked } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.WEATHER_UNLOCKED);
  });

  it('can cancel its request', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.flushReverse();
      sources.toggle('Weather Unlocked');
      expect(unlocked.expectForecast().isCancelled()).toBe(true);

      sources.toggle('Weather Unlocked');
      unlocked.flushDefault();
    });
  });

  it('rounds gps coordinates to 3 decimal places', () => {
    ctx.currentLocation = [12.3456, 65.4321];
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.flushReverse();
      unlocked.expectForecast([12.346, 65.432]);
    });
  });
});
