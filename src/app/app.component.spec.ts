import { fakeAsync } from "@angular/core/testing";
import { AppComponentHarness } from "app/app.component.harness";
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("AppComponent", () => {
  WeatherGraphContext.setup();

  let ctx: WeatherGraphContext;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  describe("when location access is denied", () => {
    let getCurrentLocation: jasmine.Spy;

    beforeEach(() => {
      getCurrentLocation = ctx.browserService.getCurrentLocation;
      getCurrentLocation.and.callFake(() => Promise.reject("User says no!"));
    });

    it("does not show an error until Current is selected", fakeAsync(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.gpsCoords = [0, 0];
      ctx.init();
      const location = new LocationOptionsComponentHarness(ctx);
      new WeatherGovHarness(ctx).expectPoints([0, 0]);

      ctx.expectNoErrorShown();
      location.select("Current");
      ctx.expectErrorShown("Location not found");

      ctx.cleanup();
    }));

    it("falls back from Weather.gov to Weather Unlocked", () => {
      fail("write this test");
    });

    describe("when no current location has been determined before", () => {
      it("shows an error, switches to Custom, and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.init();
        const app = new AppComponentHarness(ctx);
        const location = new LocationOptionsComponentHarness(ctx);

        ctx.expectErrorShown("Location not found");
        expect(app.isSidenavExpanded()).toBe(true);
        expect(location.isExpanded()).toBe(true);

        // when switching to Current
        location.select("Custom");
        ctx.expectNoErrorShown();
        location.select("Current");
        ctx.expectErrorShown("Location not found");

        ctx.cleanup();
      }));
    });

    describe("when a current location has been determined before", () => {
      it("shows an error, switches to Custom, and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.initialState.customLocation.gpsCoords = [0, 0];
        ctx.init();
        const app = new AppComponentHarness(ctx);
        const location = new LocationOptionsComponentHarness(ctx);
        const gov = new WeatherGovHarness(ctx);

        ctx.expectErrorShown("Location not found");
        expect(app.isSidenavExpanded()).toBe(true);
        expect(location.isExpanded()).toBe(true);

        // when switching to Current
        location.select("Custom");
        gov.expectPoints([0, 0]);
        ctx.expectNoErrorShown();
        location.select("Current");
        ctx.expectErrorShown("Location not found");

        ctx.cleanup();
      }));
    });
  });
});
