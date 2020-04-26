import { HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/services/refresh.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("AbstractSource", () => {
  WeatherGraphContext.setup();

  let ctx: WeatherGraphContext;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it("refreshes (only) when showing", fakeAsync(() => {
    ctx.init();
    const iq = new LocationIqServiceHarness(ctx);
    const gov = new WeatherGovHarness(ctx);
    const refresh = new RefreshServiceHarness(ctx);
    const sources = new SourceOptionsComponentHarness(ctx);
    const http = ctx.inject(HttpTestingController);

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

    ctx.cleanup();
  }));

  it("retries on next refresh after error", () => {
    fail("write this test");
  });

  describe("fallback", () => {
    it("happens invisibly on first app load", () => {
      fail("write this test");
    });

    it("does not happen on subsequent app loads", () => {
      fail("write this test");
    });

    it("does not happen on refresh", () => {
      fail("write this test");
    });
  });
});
