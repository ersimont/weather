import { HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync } from '@angular/core/testing';
import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('LocationService', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let location: LocationOptionsComponentHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, gov, graph, iq, location, refresh } = ctx.harnesses);
  });

  it('allows a reverse lookup to be cancelled', fakeAsync(() => {
    ctx.init();

    refresh.trigger();
    location.setCustomLocation('Montreal');
    expect(iq.expectReverse().isCancelled()).toBe(true);
    iq.expectForward('Montreal');

    ctx.cleanUp();
  }));

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

  it('clears the forecasts when searching for a new location', fakeAsync(() => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'Montreal';
    ctx.initialState.customLocation.gpsCoords = [0, 0];
    ctx.init({ flushDefaultRequests: false });
    gov.flushFixture([0, 0]);
    expect(graph.showsData()).toBe(true);

    location.setCustomLocation('Phoenix');
    expect(graph.showsData()).toBe(false);

    iq.expectForward('Phoenix');
    ctx.cleanUp();
  }));

  it('tracks an event when searching for a new location', fakeAsync(() => {
    ctx.init();

    location.setCustomLocation('Neverland');
    expect(events.getEvents({ name: 'change_custom_search' }).length).toBe(1);
    expect(events.getEvents({ name: 'change_current_selection' }).length).toBe(
      0,
    );

    iq.expectForward('Neverland');
    ctx.cleanUp();
  }));

  describe('refreshing', () => {
    it('works after an error fetching current location', fakeAsync(() => {
      const locationStub = ctx.mocks.browser.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject('not allowed'));
      ctx.init({ flushDefaultRequests: false });
      ctx.inject(HttpTestingController).verify();

      locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();

      ctx.cleanUp();
    }));

    it('works after an error in the reverse lookup', fakeAsync(() => {
      ctx.init({ flushDefaultRequests: false });
      iq.expectReverse().flushError();

      refresh.trigger();
      iq.flushReverse();
      gov.flushFixture();

      ctx.cleanUp();
    }));

    it('works after an error in a forward lookup', fakeAsync(() => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'not a place';
      ctx.init({ flushDefaultRequests: false });
      iq.expectForward('not a place').flushError();

      refresh.trigger();
      iq.expectForward('not a place').flush([
        iq.buildLocationResponse({ lat: '5', lon: '6' }),
      ]);
      gov.flushFixture([5, 6]);

      ctx.cleanUp();
    }));
  });
});
