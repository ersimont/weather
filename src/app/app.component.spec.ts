import { AppComponentHarness } from 'app/app.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('AppComponent', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, gov, iq, state } = ctx.harnesses);
  });

  it('tracks an event when opening the about popup', () => {
    ctx.run(() => {
      ctx.cleanUpFreshInit();

      ctx.getHarness(AppComponentHarness).openAbout();
      expect(events.getEvents('click_about').length).toBe(1);
    });
  });

  it('tracks an event when opening the privacy policy', () => {
    ctx.run(() => {
      ctx.cleanUpFreshInit();

      ctx.getHarness(AppComponentHarness).openPrivacyPolicy();
      expect(events.getEvents('click_privacy_policy').length).toBe(1);
    });
  });

  describe('when location access is denied', () => {
    beforeEach(() => {
      ctx.mocks.browser.getCurrentLocation.and.callFake(() =>
        Promise.reject('User says no!'),
      );
    });

    it('does not show an error until Current is selected', () => {
      state.setCustomLocation([0, 0]);
      ctx.run(() => {
        gov.expectPoints([0, 0]);

        ctx.expectNoErrorShown();
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        ctx.expectErrorShown('Location not found');
      });
    });

    describe('when no current location has been determined before', () => {
      it('shows an error and opens location settings', () => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.run(() => {
          const app = ctx.getHarness(AppComponentHarness);
          const location = ctx.getHarness(LocationOptionsComponentHarness);

          ctx.expectErrorShown('Location not found');
          expect(app.isSidenavOpen()).toBe(true);
          expect(location.isExpanded()).toBe(true);

          // when switching to Current
          location.setCustomLocation('Someplace else');
          iq.expectForward('Someplace else');
          ctx.expectNoErrorShown();
          location.select('Current');
          ctx.expectErrorShown('Location not found');
        });
      });
    });

    describe('when a current location has been determined before', () => {
      it('shows an error and opens location settings', () => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.initialState.customLocation.search = 'an old search';
        ctx.initialState.customLocation.gpsCoords = [0, 0];
        ctx.run(() => {
          const app = ctx.getHarness(AppComponentHarness);
          const location = ctx.getHarness(LocationOptionsComponentHarness);

          ctx.expectErrorShown('Location not found');
          expect(app.isSidenavOpen()).toBe(true);
          expect(location.isExpanded()).toBe(true);

          // when switching to Current
          location.select('Custom');
          gov.expectPoints([0, 0]);
          ctx.expectNoErrorShown();
          location.select('Current');
          ctx.expectErrorShown('Location not found');
        });
      });
    });
  });
});
