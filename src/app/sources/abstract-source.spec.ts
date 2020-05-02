import { HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/misc-services/refresh.service.harness";
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
  let http: HttpTestingController;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  function init() {
    ctx.init();
    iq = new LocationIqServiceHarness(ctx);
    gov = new WeatherGovHarness(ctx);
    unlocked = new WeatherUnlockedHarness(ctx);
    refresh = new RefreshServiceHarness(ctx);
    sources = new SourceOptionsComponentHarness(ctx);
    http = ctx.inject(HttpTestingController);
  }

  it("refreshes (only) when showing", fakeAsync(() => {
    init();
    iq.flushReverse();
    gov.flushFixture();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    sources.toggle("Weather.gov");
    refresh.trigger();
    iq.flushReverse();
    http.verify();

    sources.toggle("Weather.gov");
    gov.flushFixture();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it("retries on next refresh after error", fakeAsync(() => {
    init();
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
      init();

      iq.flushReverse();
      gov.flushNotAvailable();
      unlocked.flushFixture();
      ctx.expectNoErrorShown();

      ctx.cleanUp();
    }));

    it("does not happen on refresh", fakeAsync(() => {
      init();
      iq.flushReverse();
      gov.flushFixture();

      refresh.trigger();
      iq.flushReverse();
      gov.flushNotAvailable();
      gov.expectNotAvailableError();

      ctx.cleanUp();
    }));

    it("does not happen on subsequent app loads", fakeAsync(() => {
      ctx.initialState.allowSourceFallback = false;
      init();

      iq.flushReverse();
      gov.flushNotAvailable();
      gov.expectNotAvailableError();

      ctx.cleanUp();
    }));
  });
});
