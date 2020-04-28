import { HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync } from "@angular/core/testing";
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/services/refresh.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("LocationService", () => {
  WeatherGraphContext.setup();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let gov: WeatherGovHarness;
  let refresh: RefreshServiceHarness;
  let location: LocationOptionsComponentHarness;
  let http: HttpTestingController;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  function init() {
    ctx.init();
    iq = new LocationIqServiceHarness(ctx);
    gov = new WeatherGovHarness(ctx);
    refresh = new RefreshServiceHarness(ctx);
    location = new LocationOptionsComponentHarness(ctx);
    http = ctx.inject(HttpTestingController);
  }

  it("allows a reverse lookup to be cancelled", fakeAsync(() => {
    init();

    location.setCustomLocation("Montreal");
    expect(iq.expectReverse().isCancelled()).toBe(true);
    iq.expectForward("Montreal");

    ctx.cleanUp();
  }));

  describe("refreshing", () => {
    it("works after an error fetching current location", fakeAsync(() => {
      const locationStub = ctx.browserService.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject("not allowed"));
      init();
      http.verify();

      locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();

      ctx.cleanUp();
    }));

    it("works after an error in the reverse lookup", fakeAsync(() => {
      init();
      iq.expectReverse().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();

      ctx.cleanUp();
    }));
  });
});
