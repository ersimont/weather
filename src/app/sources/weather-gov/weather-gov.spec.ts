import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('WeatherGov', () => {
  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ gov, iq, refresh } = ctx.harnesses);
  });

  it('can cancel the first request', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);

      iq.flushReverse();
      sources.toggle('Weather.gov');
      expect(gov.expectPoints().isCancelled()).toBe(true);

      sources.toggle('Weather.gov');
      gov.flushFixture();
    });
  });

  it('can cancel the second request', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);

      iq.flushReverse();
      gov.expectPoints().flush(pointResponse);
      sources.toggle('Weather.gov');
      expect(gov.expectGrid().isCancelled()).toBe(true);

      sources.toggle('Weather.gov');
      gov.flushFixture();
    });
  });

  it('does not prevent refreshes after error', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.flushReverse();
      gov.expectPoints().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.expectPoints().flush(pointResponse);
      gov.expectGrid().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();
    });
  });

  it('rounds gps coordinates to 4 decimal places', () => {
    ctx.currentLocation = [12.34567, 76.54321];
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.flushReverse();
      gov.expectPoints([12.3457, 76.5432]);
    });
  });
});
