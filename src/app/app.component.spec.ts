import { fakeAsync } from "@angular/core/testing";
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

    it("does not show an error until Custom is selected");

    describe("when no current location has been determined before", () => {
      it("shows an error, switches to Custom, and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.init();
        ctx.expectErrorShown("Location not found");
        expect(ctx.sidenav.currentRadio()).toBeVisible();

        // when switching to Current
        ctx.selectRadio(ctx.sidenav.customRadio());
        ctx.expectNoErrorShown();
        ctx.selectRadio(ctx.sidenav.currentRadio());
        ctx.expectErrorShown("Location not found");

        ctx.cleanup();
      }));
    });

    describe("when a current location has been determined before", () => {
      // is this really what we want?
      it(
        "shows an error, but continues to use the previous location, but doesn't show the city name",
      );
    });
  });
});
