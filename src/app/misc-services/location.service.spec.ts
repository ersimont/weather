import { AppComponentHarness } from 'app/app.component.harness';
import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('LocationService', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, gov, graph, iq, refresh, state } = ctx.harnesses);
  });

  it('clears the forecasts when changing whether to use current', () => {
    state.setCustomLocation([0, 0]);
    ctx.run(() => {
      gov.flushFixture([0, 0]);
      expect(graph.showsData()).toBe(true);

      ctx.getHarness(LocationOptionsComponentHarness).select('Current');
      expect(graph.showsData()).toBe(false);

      iq.expectReverse();
    });
  });

  it('tracks an event when searching for a new location', () => {
    ctx.run(() => {
      const location = ctx.getHarness(LocationOptionsComponentHarness);
      location.setCustomLocation('Neverland');
      expect(events.getEvents('change_custom_search').length).toBe(1);
      expect(events.getEvents('change_current_selection').length).toBe(0);

      iq.expectForward('Neverland');
    });
  });

  it('triggers title changes when changing location', () => {
    ctx.run(() => {
      const location = ctx.getHarness(LocationOptionsComponentHarness);
      const app = ctx.getHarness(AppComponentHarness);

      location.select('Custom');
      expect(app.getTitle()).toBe(app.defaultTitle);

      location.setCustomLocation('new city');
      expect(app.getTitle()).toBe(app.defaultTitle);
      iq.expectForward('new city').flush([
        iq.buildLocationResponse(
          { lat: '8', lon: '9' },
          { city: 'The New City of Atlantis' },
        ),
      ]);
      iq.flushTimezone([8, 9]);
      gov.expectPoints([8, 9]);
      expect(app.getTitle()).toBe('The New City of Atlantis');

      location.select('Current');
      expect(app.getTitle()).toBe(app.defaultTitle);
      iq.expectReverse().flush(
        iq.buildLocationResponse({}, { city: 'The Current City of Atlantis' }),
      );
      expect(app.getTitle()).toBe('The Current City of Atlantis');
      gov.expectPoints();
    });
  });

  it('triggers data changes when changing location', () => {
    ctx.run(() => {
      const location = ctx.getHarness(LocationOptionsComponentHarness);
      location.select('Custom');
      expect(graph.showsData()).toBe(false);

      location.setCustomLocation('new city');
      expect(graph.showsData()).toBe(false);
      iq.expectForward('new city').flush([
        iq.buildLocationResponse({ lat: '8', lon: '9' }),
      ]);
      iq.flushTimezone([8, 9]);
      gov.flushFixture([8, 9]);
      expect(graph.showsData()).toBe(true);

      location.select('Current');
      expect(graph.showsData()).toBe(false);
      iq.flushReverse();
      gov.flushFixture();
      expect(graph.showsData()).toBe(true);
    });
  });

  describe('using current location', () => {
    it('allows a reverse lookup to be cancelled', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        const location = ctx.getHarness(LocationOptionsComponentHarness);
        location.setCustomLocation('Montreal');
        expect(iq.expectReverse().isCancelled()).toBe(true);
        iq.expectForward('Montreal');
      });
    });

    it('clears city after an error fetching current location, and allows refreshing', () => {
      const locationStub = ctx.mocks.browser.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject('not allowed'));
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.run(() => {
        const app = ctx.getHarness(AppComponentHarness);
        expect(app.getTitle()).toBe(app.defaultTitle);

        locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
        refresh.trigger();
        iq.expectReverse().flush(
          iq.buildLocationResponse({ address: { city: 'restored' } }),
        );
        expect(app.getTitle()).toBe('restored');
        gov.flushFixture();
      });
    });

    it('clears the city after an error in the reverse lookup, and allows refreshing', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.run(() => {
        const app = ctx.getHarness(AppComponentHarness);

        iq.expectReverse().flushError();
        expect(app.getTitle()).toBe(app.defaultTitle);

        refresh.trigger();
        iq.expectReverse().flush(
          iq.buildLocationResponse({ address: { city: 'restored' } }),
        );
        expect(app.getTitle()).toBe('restored');
        gov.flushFixture();
      });
    });
  });

  describe('using custom location', () => {
    beforeEach(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'Initial search';
    });

    it('clears the forecasts when searching for a new location', () => {
      ctx.initialState.customLocation.gpsCoords = [0, 0];
      ctx.run(() => {
        const location = ctx.getHarness(LocationOptionsComponentHarness);
        gov.flushFixture([0, 0]);
        expect(graph.showsData()).toBe(true);

        location.setCustomLocation('Phoenix');
        expect(graph.showsData()).toBe(false);

        iq.expectForward('Phoenix');
      });
    });

    it('shows a nice message when not found, and can retry', () => {
      ctx.run(() => {
        const location = ctx.getHarness(LocationOptionsComponentHarness);
        iq.expectForward('Initial search').flushError(404);
        ctx.expectErrorShown('Location not found');

        location.setCustomLocation('a place');
        iq.expectForward('a place').flushError(500);
        ctx.expectGenericErrorShown();

        refresh.trigger();
        iq.expectForward('a place').flush([
          iq.buildLocationResponse({ lat: '12', lon: '-89' }),
        ]);
        iq.flushTimezone([12, -89]);
        gov.flushFixture([12, -89]);
      });
    });

    it("reuses gpsCoordinates when the search hasn't changed", () => {
      state.setCustomLocation([45.4972, -73.6104]);
      ctx.run(() => {
        const location = ctx.getHarness(LocationOptionsComponentHarness);
        // no call to locationIq
        gov.flushFixture([45.4972, -73.6104]);

        location.select('Current');
        iq.flushReverse();
        gov.flushFixture();

        location.select('Custom');
        // no call to locationIq
        gov.flushFixture([45.4972, -73.6104]);
      });
    });
  });
});
