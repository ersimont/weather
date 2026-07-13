import { AppComponentHarness } from 'app/app.component.harness';
import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('LocationService', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, gov, graph, iq, refresh, state } = ctx.harnesses);
  });

  it('clears the forecasts when changing whether to use current', async () => {
    state.setCustomLocation([0, 0]);
    await ctx.run(async () => {
      await gov.flushFixture([0, 0]);
      expect(graph.showsData()).toBe(true);

      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.select('Current');
      expect(graph.showsData()).toBe(false);

      iq.expectReverse();
    });
  });

  it('tracks an event when searching for a new location', async () => {
    state.setCustomLocation();
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      gov.expectPoints();

      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      await location.setCustomLocation('Neverland');
      await events.expectOne('change_custom_search', {
        category: 'change_location',
      });
      await events.expectNone('change_current_selection');

      iq.expectForward('Neverland');
    });
  });

  it('triggers title changes when changing location', async () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.initialState.currentLocation.city = 'Starting point';
    await ctx.run(async () => {
      iq.expectReverse();
      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      const app = await ctx.getHarness(AppComponentHarness);

      expect(await app.getTitle()).toBe('Starting point');
      await location.select('Custom');
      expect(await app.getTitle()).toBe(app.defaultTitle);

      await location.setCustomLocation('new city');
      await iq
        .expectForward('new city')
        .flush([
          iq.buildLocationResponse(
            { lat: '8', lon: '9' },
            { city: 'The New City of Atlantis' },
          ),
        ]);
      expect(await app.getTitle()).toBe('The New City of Atlantis');
      iq.expectTimezone([8, 9]);

      await location.select('Current');
      expect(await app.getTitle()).toBe(app.defaultTitle);
      await iq
        .expectReverse()
        .flush(
          iq.buildLocationResponse(
            {},
            { city: 'The Current City of Atlantis' },
          ),
        );
      expect(await app.getTitle()).toBe('The Current City of Atlantis');
      gov.expectPoints();
    });
  });

  it('triggers data changes when changing location', async () => {
    await ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      const location = await ctx.getHarness(LocationOptionsComponentHarness);

      await location.setCustomLocation('new city');
      await iq
        .expectForward('new city')
        .flush([iq.buildLocationResponse({ lat: '8', lon: '9' })]);
      await iq.flushTimezone([8, 9]);
      await gov.flushFixture([8, 9]);
      expect(graph.showsData()).toBe(true);

      await location.select('Current');
      expect(graph.showsData()).toBe(false);
      await iq.flushReverse();
      await gov.flushFixture();
      expect(graph.showsData()).toBe(true);
    });
  });

  describe('using current location', () => {
    it('allows a reverse lookup to be cancelled', async () => {
      ctx.initialState.useCurrentLocation = true;
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        await location.setCustomLocation('Montreal');
        expect(iq.expectReverse().isCancelled()).toBe(true);
        iq.expectForward('Montreal');
      });
    });

    it('clears city after an error fetching current location, and allows refreshing', async () => {
      const locationStub = ctx.mocks.browser.getCurrentLocation;
      locationStub.mockRejectedValue('not allowed');
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      await ctx.run(async () => {
        errors.expect('Location not found');
        const app = await ctx.getHarness(AppComponentHarness);
        expect(await app.getTitle()).toBe(app.defaultTitle);

        locationStub.mockResolvedValue(ctx.currentLocation);
        await refresh.trigger();
        await iq
          .expectReverse()
          .flush(iq.buildLocationResponse({ address: { city: 'restored' } }));
        expect(await app.getTitle()).toBe('restored');
        await gov.flushFixture();
      });
    });

    it('clears the city after an error in the reverse lookup, and allows refreshing', async () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.initialState.currentLocation.city = 'A previous value';
      await ctx.run(async () => {
        const app = await ctx.getHarness(AppComponentHarness);

        await iq.expectReverse().flushError();
        errors.expectGeneric();
        expect(await app.getTitle()).toBe(app.defaultTitle);

        await refresh.trigger();
        await iq
          .expectReverse()
          .flush(iq.buildLocationResponse({ address: { city: 'restored' } }));
        expect(await app.getTitle()).toBe('restored');
        await gov.flushFixture();
      });
    });
  });

  describe('using custom location', () => {
    it('clears the forecasts when searching for a new location', async () => {
      state.setCustomLocation([0, 0]);
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        await gov.flushFixture([0, 0]);
        expect(graph.showsData()).toBe(true);

        await location.setCustomLocation('Phoenix');
        expect(graph.showsData()).toBe(false);

        iq.expectForward('Phoenix');
      });
    });

    it('clears the timezone when searching for a new location (production bug)', async () => {
      state.setCustomLocation([1, 2]);
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        gov.expectPoints([1, 2]);

        await location.setCustomLocation('city 2');
        await iq
          .expectForward('city 2')
          .flush([iq.buildLocationResponse({ lat: '3', lon: '4' })]);
        await iq.expectTimezone([3, 4]).flushError();
        errors.expectGeneric();

        await refresh.trigger();
        iq.expectTimezone([3, 4]); // <- this was not happening
      });
    });

    it('shows a nice message when not found, and can retry', async () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'Initial search';
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        await iq.expectForward('Initial search').flushError(404);
        errors.expect('Location not found');

        await location.setCustomLocation('a place');
        await iq.expectForward('a place').flushError(500);
        errors.expectGeneric();

        await refresh.trigger();
        await iq
          .expectForward('a place')
          .flush([iq.buildLocationResponse({ lat: '12', lon: '-89' })]);
        await iq.flushTimezone([12, -89]);
        await gov.flushFixture([12, -89]);
      });
    });

    it("reuses gps coordinates & timezone when the search hasn't changed", async () => {
      state.setCustomLocation([45.4972, -73.6104]);
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);

        // no call to locationIq
        await gov.flushFixture([45.4972, -73.6104]);

        await location.select('Current');
        await iq.flushReverse();
        await gov.flushFixture();

        await location.select('Custom');
        // no call to locationIq
        await gov.flushFixture([45.4972, -73.6104]);
      });
    });

    it('picks up from the time zone if that was the only piece missing', async () => {
      state.setCustomLocation([45.4972, -73.6104]);
      ctx.initialState.customLocation.timezone = undefined;
      await ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);

        // no forward search
        iq.expectTimezone([45.4972, -73.6104]);

        await location.select('Current');
        iq.expectReverse();

        await location.select('Custom');
        await iq.expectTimezone([45.4972, -73.6104]).flushError();
        errors.expectGeneric();

        await refresh.trigger();
        iq.expectTimezone([45.4972, -73.6104]);
      });
    });
  });
});
