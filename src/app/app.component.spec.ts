import { fakeAsync } from "@angular/core/testing";
import { expectWeatherGovPoints } from "app/test-helpers/request-helpers";
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

    it("does not show an error until Custom is selected", fakeAsync(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.gpsCoords = [0, 0];
      ctx.init();
      expectWeatherGovPoints([0, 0]);

      ctx.expectNoErrorShown();
      expect(ctx.sidenav.el()).toBeHidden();
      ctx.selectRadio(ctx.sidenav.currentRadio());
      ctx.expectErrorShown("Location not found");

      ctx.cleanup();
    }));

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
      it("shows an error, switches to Custom, and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.initialState.customLocation.gpsCoords = [0, 0];
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
  });
});
