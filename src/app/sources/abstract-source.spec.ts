import { HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync } from "@angular/core/testing";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/misc-services/refresh.service.harness";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { pointResponse } from "app/sources/weather-gov/weather-gov.fixtures";
import { WeatherGovHarness } from "app/sources/weather-gov/weather-gov.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked/weather-unlocked.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("AbstractSource", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let gov: WeatherGovHarness;
  let unlocked: WeatherUnlockedHarness;
  let refresh: RefreshServiceHarness;
  let sources: SourceOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, gov, unlocked, refresh, sources } = ctx.harnesses);
  });

  it("refreshes (only) when showing", fakeAsync(() => {
    ctx.init();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    sources.toggle("Weather.gov");
    refresh.trigger();
    iq.flushReverse();
    ctx.inject(HttpTestingController).verify();

    sources.toggle("Weather.gov");
    gov.flushFixture();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it("retries on next refresh after error", fakeAsync(() => {
    ctx.init({ flushDefaultRequests: false });
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

    ctx.cleanUp();
  }));

  describe("fallback", () => {
    it("happens invisibly on first app load", fakeAsync(() => {
      ctx.init({ flushDefaultRequests: false });

      iq.flushReverse();
      gov.flushNotAvailable();
      unlocked.flushFixture();
      ctx.expectNoErrorShown();

      ctx.cleanUp();
    }));

    it("does not happen on refresh", fakeAsync(() => {
      ctx.init();

      refresh.trigger();
      iq.flushReverse();
      gov.flushNotAvailable();
      gov.expectNotAvailableError();

      ctx.cleanUp();
    }));

    it("does not happen on subsequent app loads", fakeAsync(() => {
      ctx.initialState.allowSourceFallback = false;
      ctx.init({ flushDefaultRequests: false });

      iq.flushReverse();
      gov.flushNotAvailable();
      gov.expectNotAvailableError();

      ctx.cleanUp();
    }));
  });
});
