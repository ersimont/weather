import { HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync } from "@angular/core/testing";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("LocationService", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it("allows a reverse lookup to be cancelled", fakeAsync(() => {
    ctx.init();

    ctx.help.location.setCustomLocation("Montreal");
    expect(ctx.help.iq.expectReverse().isCancelled()).toBe(true);
    ctx.help.iq.expectForward("Montreal");

    ctx.cleanUp();
  }));

  describe("refreshing", () => {
    it("works after an error fetching current location", fakeAsync(() => {
      const locationStub = ctx.mock.browser.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject("not allowed"));
      ctx.init();
      ctx.inject(HttpTestingController).verify();

      locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
      ctx.help.refresh.trigger();
      ctx.help.iq.flushReverse();
      ctx.help.gov.flushFixture();

      ctx.cleanUp();
    }));

    it("works after an error in the reverse lookup", fakeAsync(() => {
      ctx.init();
      ctx.help.iq.expectReverse().flushError();

      ctx.help.refresh.trigger();
      ctx.help.iq.flushReverse();
      ctx.help.gov.flushFixture();

      ctx.cleanUp();
    }));
  });
});
