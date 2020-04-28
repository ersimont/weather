import { fakeAsync } from "@angular/core/testing";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("AppComponent", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  describe("when location access is denied", () => {
    beforeEach(() => {
      ctx.mock.browser.getCurrentLocation.and.callFake(() =>
        Promise.reject("User says no!"),
      );
    });

    it("does not show an error until Current is selected", fakeAsync(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation = {
        search: "previous search",
        gpsCoords: [0, 0],
      };
      ctx.init();
      ctx.help.gov.expectPoints([0, 0]);

      ctx.expectNoErrorShown();
      ctx.help.location.select("Current");
      ctx.expectErrorShown("Location not found");

      ctx.cleanUp();
    }));

    describe("when no current location has been determined before", () => {
      it("shows an error and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.init();

        ctx.expectErrorShown("Location not found");
        expect(ctx.help.app.isSidenavExpanded()).toBe(true);
        expect(ctx.help.location.isExpanded()).toBe(true);

        // when switching to Current
        ctx.help.location.setCustomLocation("Someplace else");
        ctx.help.iq.expectForward("Someplace else");
        ctx.expectNoErrorShown();
        ctx.help.location.select("Current");
        ctx.expectErrorShown("Location not found");

        ctx.cleanUp();
      }));
    });

    describe("when a current location has been determined before", () => {
      it("shows an error and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.initialState.customLocation.search = "an old search";
        ctx.initialState.customLocation.gpsCoords = [0, 0];
        ctx.init();

        ctx.expectErrorShown("Location not found");
        expect(ctx.help.app.isSidenavExpanded()).toBe(true);
        expect(ctx.help.location.isExpanded()).toBe(true);

        // when switching to Current
        ctx.help.location.select("Custom");
        ctx.help.gov.expectPoints([0, 0]);
        ctx.expectNoErrorShown();
        ctx.help.location.select("Current");
        ctx.expectErrorShown("Location not found");

        ctx.cleanUp();
      }));
    });
  });
});
