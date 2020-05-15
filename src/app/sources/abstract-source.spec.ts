import { HttpTestingController } from '@angular/common/http/testing';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('AbstractSource', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let gov: WeatherGovHarness;
  let unlocked: WeatherUnlockedHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, gov, unlocked, refresh } = ctx.harnesses);
  });

  it('refreshes (only) when showing', () => {
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);

      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();

      sources.toggle('Weather.gov');
      refresh.trigger();
      iq.flushReverse();
      ctx.inject(HttpTestingController).verify();

      sources.toggle('Weather.gov');
      gov.flushFixture();

      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();
    });
  });

  it('retries on next refresh after error', () => {
    ctx.run({ flushDefaultRequests: false }, () => {
      iq.expectReverse().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.expectPoints().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.expectPoints().flush(pointResponse);
      gov.expectGrid().flushError();

      refresh.trigger();
      iq.expectReverse();
    });
  });

  describe('fallback', () => {
    it('happens invisibly on first app load', () => {
      ctx.run({ flushDefaultRequests: false }, () => {
        iq.flushReverse();
        gov.flushNotAvailable();
        unlocked.flushDefault();
        ctx.expectNoErrorShown();
      });
    });

    it('does not happen on refresh', () => {
      ctx.run(() => {
        refresh.trigger();
        iq.flushReverse();
        gov.flushNotAvailable();
        gov.expectNotAvailableError();
      });
    });

    it('does not happen on subsequent app loads', () => {
      ctx.initialState.allowSourceFallback = false;
      ctx.run({ flushDefaultRequests: false }, () => {
        iq.flushReverse();
        gov.flushNotAvailable();
        gov.expectNotAvailableError();
      });
    });
  });
});
