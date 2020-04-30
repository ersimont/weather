import { fakeAsync } from "@angular/core/testing";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("WeatherGov", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it("can cancel the first request", fakeAsync(() => {
    ctx.init();

    ctx.help.iq.flushReverse();
    ctx.help.sources.toggle("Weather.gov");
    expect(ctx.help.gov.expectPoints().isCancelled()).toBe(true);

    ctx.help.sources.toggle("Weather.gov");
    ctx.help.gov.flushFixture();

    ctx.cleanUp();
  }));

  it("can cancel the second request", fakeAsync(() => {
    ctx.init();

    ctx.help.iq.flushReverse();
    ctx.help.gov.expectPoints().flush(ctx.help.gov.pointsFixture);
    ctx.help.sources.toggle("Weather.gov");
    expect(ctx.help.gov.expectGrid().isCancelled()).toBe(true);

    ctx.help.sources.toggle("Weather.gov");
    ctx.help.gov.flushFixture();

    ctx.cleanUp();
  }));

  it("does not prevent refreshes after error", fakeAsync(() => {
    ctx.init();

    ctx.help.iq.flushReverse();
    ctx.help.gov.expectPoints().flushError();

    ctx.help.refresh.trigger();
    ctx.help.iq.flushReverse();
    ctx.help.gov.expectPoints().flush(ctx.help.gov.pointsFixture);
    ctx.help.gov.expectGrid().flushError();

    ctx.help.refresh.trigger();
    ctx.help.iq.flushReverse();
    ctx.help.gov.flushFixture();

    ctx.cleanUp();
  }));
});
