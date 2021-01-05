import { AppComponentHarness } from 'app/app.component.harness';
import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('LocationService', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let errors: SnackBarErrorServiceHarness;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, errors, gov, graph, iq, refresh, state } = ctx.harnesses);
  });

  it('clears the forecasts when changing whether to use current', () => {
    state.setCustomLocation([0, 0]);
    ctx.run(async () => {
      gov.flushFixture([0, 0]);
      expect(graph.showsData()).toBe(true);

      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.select('Current');
      expect(graph.showsData()).toBe(false);

      iq.expectReverse();
    });
  });

  it('tracks an event when searching for a new location', () => {
    state.setCustomLocation();
    ctx.run(async () => {
      gov.expectPoints();

      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      await location.setCustomLocation('Neverland');
      expect(events.getEvents('change_custom_search').length).toBe(1);
      expect(events.getEvents('change_current_selection').length).toBe(0);

      iq.expectForward('Neverland');
    });
  });

  it('triggers title changes when changing location', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.initialState.currentLocation.city = 'Starting point';
    ctx.run(async () => {
      iq.expectReverse();
      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      const app = await ctx.getHarness(AppComponentHarness);

      expect(await app.getTitle()).toBe('Starting point');
      await location.select('Custom');
      expect(await app.getTitle()).toBe(app.defaultTitle);

      await location.setCustomLocation('new city');
      iq.expectForward('new city').flush([
        iq.buildLocationResponse(
          { lat: '8', lon: '9' },
          { city: 'The New City of Atlantis' },
        ),
      ]);
      expect(await app.getTitle()).toBe('The New City of Atlantis');
      iq.expectTimezone([8, 9]);

      await location.select('Current');
      expect(await app.getTitle()).toBe(app.defaultTitle);
      iq.expectReverse().flush(
        iq.buildLocationResponse({}, { city: 'The Current City of Atlantis' }),
      );
      expect(await app.getTitle()).toBe('The Current City of Atlantis');
      gov.expectPoints();
    });
  });

  it('triggers data changes when changing location', () => {
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      const location = await ctx.getHarness(LocationOptionsComponentHarness);

      await location.setCustomLocation('new city');
      iq.expectForward('new city').flush([
        iq.buildLocationResponse({ lat: '8', lon: '9' }),
      ]);
      iq.flushTimezone([8, 9]);
      gov.flushFixture([8, 9]);
      expect(graph.showsData()).toBe(true);

      await location.select('Current');
      expect(graph.showsData()).toBe(false);
      iq.flushReverse();
      gov.flushFixture();
      expect(graph.showsData()).toBe(true);
    });
  });

  describe('using current location', () => {
    it('allows a reverse lookup to be cancelled', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        await location.setCustomLocation('Montreal');
        expect(iq.expectReverse().isCancelled()).toBe(true);
        iq.expectForward('Montreal');
      });
    });

    it('clears city after an error fetching current location, and allows refreshing', () => {
      const locationStub = ctx.mocks.browser.getCurrentLocation;
      locationStub.and.returnValue(Promise.reject('not allowed'));
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.run(async () => {
        errors.expect('Location not found');
        const app = await ctx.getHarness(AppComponentHarness);
        expect(await app.getTitle()).toBe(app.defaultTitle);

        locationStub.and.returnValue(Promise.resolve(ctx.currentLocation));
        refresh.trigger();
        iq.expectReverse().flush(
          iq.buildLocationResponse({ address: { city: 'restored' } }),
        );
        expect(await app.getTitle()).toBe('restored');
        gov.flushFixture();
      });
    });

    it('clears the city after an error in the reverse lookup, and allows refreshing', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      ctx.run(async () => {
        const app = await ctx.getHarness(AppComponentHarness);

        iq.expectReverse().flushError();
        errors.expectGeneric();
        expect(await app.getTitle()).toBe(app.defaultTitle);

        refresh.trigger();
        iq.expectReverse().flush(
          iq.buildLocationResponse({ address: { city: 'restored' } }),
        );
        expect(await app.getTitle()).toBe('restored');
        gov.flushFixture();
      });
    });
  });

  describe('using custom location', () => {
    it('clears the forecasts when searching for a new location', () => {
      state.setCustomLocation([0, 0]);
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        gov.flushFixture([0, 0]);
        expect(graph.showsData()).toBe(true);

        await location.setCustomLocation('Phoenix');
        expect(graph.showsData()).toBe(false);

        iq.expectForward('Phoenix');
      });
    });

    it('clears the timezone when searching for a new location (production bug)', () => {
      state.setCustomLocation([1, 2]);
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        gov.expectPoints([1, 2]);

        await location.setCustomLocation('city 2');
        iq.expectForward('city 2').flush([
          iq.buildLocationResponse({ lat: '3', lon: '4' }),
        ]);
        iq.expectTimezone([3, 4]).flushError();
        errors.expectGeneric();

        refresh.trigger();
        iq.expectTimezone([3, 4]); // <- this was not happening
      });
    });

    it('shows a nice message when not found, and can retry', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'Initial search';
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        iq.expectForward('Initial search').flushError(404);
        errors.expect('Location not found');

        await location.setCustomLocation('a place');
        iq.expectForward('a place').flushError(500);
        errors.expectGeneric();

        refresh.trigger();
        iq.expectForward('a place').flush([
          iq.buildLocationResponse({ lat: '12', lon: '-89' }),
        ]);
        iq.flushTimezone([12, -89]);
        gov.flushFixture([12, -89]);
      });
    });

    it("reuses gps coordinates & timezone when the search hasn't changed", () => {
      state.setCustomLocation([45.4972, -73.6104]);
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);

        // no call to locationIq
        gov.flushFixture([45.4972, -73.6104]);

        await location.select('Current');
        iq.flushReverse();
        gov.flushFixture();

        await location.select('Custom');
        // no call to locationIq
        gov.flushFixture([45.4972, -73.6104]);
      });
    });

    it('picks up from the time zone if that was the only piece missing', () => {
      state.setCustomLocation([45.4972, -73.6104]);
      ctx.initialState.customLocation.timezone = undefined;
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);

        // no forward search
        iq.expectTimezone([45.4972, -73.6104]);

        await location.select('Current');
        iq.expectReverse();

        await location.select('Custom');
        iq.expectTimezone([45.4972, -73.6104]).flushError();
        errors.expectGeneric();

        refresh.trigger();
        iq.expectTimezone([45.4972, -73.6104]);
      });
    });
  });
});
