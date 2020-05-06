import { fakeAsync } from '@angular/core/testing';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('WeatherGov', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  let sources: SourceOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ gov, iq, refresh, sources } = ctx.harnesses);
  });

  it('can cancel the first request', fakeAsync(() => {
    ctx.init({ flushDefaultRequests: false });

    iq.flushReverse();
    sources.toggle('Weather.gov');
    expect(gov.expectPoints().isCancelled()).toBe(true);

    sources.toggle('Weather.gov');
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it('can cancel the second request', fakeAsync(() => {
    ctx.init({ flushDefaultRequests: false });

    iq.flushReverse();
    gov.expectPoints().flush(pointResponse);
    sources.toggle('Weather.gov');
    expect(gov.expectGrid().isCancelled()).toBe(true);

    sources.toggle('Weather.gov');
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it('does not prevent refreshes after error', fakeAsync(() => {
    ctx.init({ flushDefaultRequests: false });

    iq.flushReverse();
    gov.expectPoints().flushError();

    refresh.trigger();
    iq.flushReverse();
    gov.expectPoints().flush(pointResponse);
    gov.expectGrid().flushError();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    ctx.cleanUp();
  }));
});
