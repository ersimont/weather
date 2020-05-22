import { AppComponentHarness } from 'app/app.component.harness';
import { GraphStateHarness } from 'app/graph/state/graph-state.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('AppComponent', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let errors: SnackBarErrorServiceHarness;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, errors, gov, iq, state } = ctx.harnesses);
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

  it('has buttons to snap to date ranges', () => {
    ctx.startTime = new Date(2020, 5, 21);
    ctx.run(() => {
      const app = ctx.getHarness(AppComponentHarness);
      const graphState = new GraphStateHarness(ctx);
      ctx.cleanUpFreshInit();

      app.snapToRange('three-days');
      expect(graphState.getRange()).toEqual([1592706600000, 1592965800000]);

      ctx.tick(1, 'min');
      app.snapToRange('day');
      expect(graphState.getRange()).toEqual([1592706660000, 1592793060000]);

      ctx.tick(2, 'min');
      app.snapToRange('week');
      expect(graphState.getRange()).toEqual([1592706780000, 1593311580000]);
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

        errors.verify();
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        errors.expect('Location not found');
      });
    });

    describe('when no current location has been determined before', () => {
      it('shows an error and opens location settings', () => {
        // when the app opens
        ctx.initialState.useCurrentLocation = true;
        ctx.run(() => {
          const app = ctx.getHarness(AppComponentHarness);
          const location = ctx.getHarness(LocationOptionsComponentHarness);

          errors.expect('Location not found');
          expect(app.isSidenavOpen()).toBe(true);
          expect(location.isExpanded()).toBe(true);

          // when switching to Current
          location.setCustomLocation('Someplace else');
          iq.expectForward('Someplace else');
          errors.verify();
          location.select('Current');
          errors.expect('Location not found');
        });
      });
    });

    describe('when a current location has been determined before', () => {
      it('shows an error and opens location settings', () => {
        // when the app opens
        state.setCustomLocation([0, 0]);
        ctx.initialState.useCurrentLocation = true;
        ctx.run(() => {
          const app = ctx.getHarness(AppComponentHarness);
          const location = ctx.getHarness(LocationOptionsComponentHarness);

          errors.expect('Location not found');
          expect(app.isSidenavOpen()).toBe(true);
          expect(location.isExpanded()).toBe(true);

          // when switching to Current
          location.select('Custom');
          gov.expectPoints([0, 0]);
          errors.verify();
          location.select('Current');
          errors.expect('Location not found');
        });
      });
    });
  });
});
