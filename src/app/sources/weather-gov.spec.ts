import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/services/refresh.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("WeatherGov", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let gov: WeatherGovHarness;
  let refresh: RefreshServiceHarness;
  let sources: SourceOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, gov, refresh, sources } = ctx.help);
  });

  it("can cancel the first request", fakeAsync(() => {
    ctx.init();

    iq.flushReverse();
    sources.toggle("Weather.gov");
    expect(gov.expectPoints().isCancelled()).toBe(true);

    sources.toggle("Weather.gov");
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it("can cancel the second request", fakeAsync(() => {
    ctx.init();

    iq.flushReverse();
    gov.expectPoints().flush(gov.pointsFixture);
    sources.toggle("Weather.gov");
    expect(gov.expectGrid().isCancelled()).toBe(true);

    sources.toggle("Weather.gov");
    gov.flushFixture();

    ctx.cleanUp();
  }));

  it("does not prevent refreshes after error", fakeAsync(() => {
    ctx.init();

    iq.flushReverse();
    gov.expectPoints().flushError();

    refresh.trigger();
    iq.flushReverse();
    gov.expectPoints().flush(gov.pointsFixture);
    gov.expectGrid().flushError();

    refresh.trigger();
    iq.flushReverse();
    gov.flushFixture();

    ctx.cleanUp();
  }));
});
