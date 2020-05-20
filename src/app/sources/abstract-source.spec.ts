import { HttpTestingController } from '@angular/common/http/testing';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('AbstractSource', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let gov: WeatherGovHarness;
  let unlocked: WeatherUnlockedHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, gov, unlocked, refresh, state } = ctx.harnesses);
  });

  it('refreshes (only) when showing', () => {
    state.setCustomLocation();
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);

      gov.flushFixture();

      sources.toggle('Weather.gov');
      refresh.trigger();
      ctx.inject(HttpTestingController).verify();

      sources.toggle('Weather.gov');
      gov.flushFixture();

      refresh.trigger();
      gov.flushFixture();
    });
  });

  it('retries on next refresh after error', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(() => {
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
      ctx.run({ useInitialState: false }, () => {
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        iq.flushReverse();
        gov.flushNotAvailable();
        unlocked.flushDefault();
        ctx.expectNoErrorShown();
      });
    });

    it('does not happen on refresh', () => {
      ctx.run({ useInitialState: false }, () => {
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        iq.flushReverse();
        gov.flushFixture();

        refresh.trigger();
        iq.flushReverse();
        gov.flushNotAvailable();
        gov.expectNotAvailableError();
      });
    });

    it('does not happen on subsequent app loads', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.allowSourceFallback = false;
      ctx.run(() => {
        iq.flushReverse();
        gov.flushNotAvailable();
        gov.expectNotAvailableError();
      });
    });
  });
});
