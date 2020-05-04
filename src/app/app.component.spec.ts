import { fakeAsync } from "@angular/core/testing";
import { AppComponentHarness } from "app/app.component.harness";
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov/weather-gov.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { EventTrackingServiceHarness } from "app/to-replace/event-tracking/event-tracking.service.harness";

describe("AppComponent", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let app: AppComponentHarness;
  let events: EventTrackingServiceHarness;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let location: LocationOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ app, events, gov, iq, location } = ctx.harnesses);
  });

  it("tracks an event when opening the privacy policy", fakeAsync(() => {
    ctx.init();

    app.openPrivacyPolicy();
    expect(events.getEventCount("click_privacy_policy")).toBe(1);

    ctx.cleanUp();
  }));

  describe("when location access is denied", () => {
    beforeEach(() => {
      ctx.mocks.browser.getCurrentLocation.and.callFake(() =>
        Promise.reject("User says no!"),
      );
    });

    it("does not show an error until Current is selected", fakeAsync(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation = {
        search: "previous search",
        gpsCoords: [0, 0],
      };
      ctx.init({ flushDefaultRequests: false });
      gov.expectPoints([0, 0]);

      ctx.expectNoErrorShown();
      location.select("Current");
      ctx.expectErrorShown("Location not found");

      ctx.cleanUp();
    }));

    describe("when no current location has been determined before", () => {
      it("shows an error and opens location settings", fakeAsync(() => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.init({ flushDefaultRequests: false });

        ctx.expectErrorShown("Location not found");
        expect(app.isSidenavExpanded()).toBe(true);
        expect(location.isExpanded()).toBe(true);

        // when switching to Current
        location.setCustomLocation("Someplace else");
        iq.expectForward("Someplace else");
        ctx.expectNoErrorShown();
        location.select("Current");
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
        ctx.init({ flushDefaultRequests: false });

        ctx.expectErrorShown("Location not found");
        expect(app.isSidenavExpanded()).toBe(true);
        expect(location.isExpanded()).toBe(true);

        // when switching to Current
        location.select("Custom");
        gov.expectPoints([0, 0]);
        ctx.expectNoErrorShown();
        location.select("Current");
        ctx.expectErrorShown("Location not found");

        ctx.cleanUp();
      }));
    });
  });
});
