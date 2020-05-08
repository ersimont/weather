import { fakeAsync } from '@angular/core/testing';
import { AppComponentHarness } from 'app/app.component.harness';
import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('LocationService', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let app: AppComponentHarness;
  let events: EventTrackingServiceHarness;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let location: LocationOptionsComponentHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ app, events, gov, graph, iq, location, refresh } = ctx.harnesses);
  });

  it('clears the forecasts when changing whether to use current', fakeAsync(() => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'blah';
    ctx.initialState.customLocation.gpsCoords = [0, 0];
    ctx.init({ flushDefaultRequests: false });
    gov.flushFixture([0, 0]);
    expect(graph.showsData()).toBe(true);

    location.select('Current');
    expect(graph.showsData()).toBe(false);

    iq.expectReverse();
    ctx.cleanUp();
  }));

  it('tracks an event when searching for a new location', fakeAsync(() => {
    ctx.init();

    location.setCustomLocation('Neverland');
    expect(events.getEvents('change_custom_search').length).toBe(1);
    expect(events.getEvents('change_current_selection').length).toBe(0);

    iq.expectForward('Neverland');
    ctx.cleanUp();
  }));

  it('uses the current location when the search is empty', fakeAsync(() => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = '';
    ctx.init({ flushDefaultRequests: false });

    iq.flushReverse(ctx.currentLocation);
    gov.expectPoints(ctx.currentLocation);

    ctx.cleanUp();
  }));

  describe('using current location', () => {
    it('allows a reverse lookup to be cancelled', fakeAsync(() => {
      ctx.init();

      refresh.trigger();
      location.setCustomLocation('Montreal');
      expect(iq.expectReverse().isCancelled()).toBe(true);
      iq.expectForward('Montreal');

      ctx.cleanUp();
    }));

    it('clears city after an error fetching current location, and allows refreshing', fakeAsync(() => {
      const locationStub = ctx.mocks.browser.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject('not allowed'));
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.init({ flushDefaultRequests: false });

      expect(app.getTitle()).toBe(app.defaultTitle);

      locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
      refresh.trigger();
      iq.expectReverse().flush(
        iq.buildLocationResponse({ address: { city: 'restored' } }),
      );
      expect(app.getTitle()).toBe('restored');
      gov.flushFixture();

      ctx.cleanUp();
    }));

    it('clears the city after an error in the reverse lookup, and allows refreshing', fakeAsync(() => {
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.init({ flushDefaultRequests: false });

      iq.expectReverse().flushError();
      expect(app.getTitle()).toBe(app.defaultTitle);

      refresh.trigger();
      iq.expectReverse().flush(
        iq.buildLocationResponse({ address: { city: 'restored' } }),
      );
      expect(app.getTitle()).toBe('restored');
      gov.flushFixture();

      ctx.cleanUp();
    }));
  });

  describe('using custom location', () => {
    beforeEach(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'Initial search';
    });

    it('clears the forecasts when searching for a new location', fakeAsync(() => {
      ctx.initialState.customLocation.gpsCoords = [0, 0];
      ctx.init({ flushDefaultRequests: false });
      gov.flushFixture([0, 0]);
      expect(graph.showsData()).toBe(true);

      location.setCustomLocation('Phoenix');
      expect(graph.showsData()).toBe(false);

      iq.expectForward('Phoenix');
      ctx.cleanUp();
    }));

    it('shows a nice message when not found, and can retry', fakeAsync(() => {
      ctx.init({ flushDefaultRequests: false });

      iq.expectForward('Initial search').flushError(404);
      ctx.expectErrorShown('Location not found');

      location.setCustomLocation('a place');
      iq.expectForward('a place').flushError(500);
      ctx.expectGenericErrorShown();

      refresh.trigger();
      iq.expectForward('a place').flush([
        iq.buildLocationResponse({ lat: '12', lon: '-89' }),
      ]);
      gov.flushFixture([12, -89]);

      ctx.cleanUp();
    }));
  });
});
