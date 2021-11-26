import { GraphStateHarness } from 'app/graph/state/graph-state.harness';
import { GraphStoreHarness } from 'app/graph/state/graph-store.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('GraphStore', () => {
  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ gov, iq, refresh } = ctx.harnesses);
  });

  it('sets the time zone according to the location', () => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'New Zealand';
    ctx.initialState.customLocation.gpsCoords = [-44, 171];
    ctx.initialState.customLocation.timezone = 'Pacific/Auckland';
    ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
    const { graph } = ctx.harnesses;
    ctx.run(async () => {
      gov.expectPoints([-44, 171]);
      expect(graph.getTimeZone()).toBe('Pacific/Auckland');

      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.select('Current');
      iq.expectReverse();
      expect(graph.getTimeZone()).toBe(undefined);
    });
    ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
  });

  describe('night boxing', () => {
    it('updates with location', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.currentLocation = [144, -122];
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        iq.flushReverse([144, -122]);
        gov.expectPoints([144, -122]);
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getNightBoxes()[0]).toEqual([
          342066821989, 342105060171,
        ]);

        ctx.currentLocation = [10, -20];
        refresh.trigger();
        iq.flushReverse([10, -20]);
        gov.expectPoints([10, -20]);
        expect(graphState.getNightBoxes()[0]).toEqual([
          342039449477, 342083544424,
        ]);
      });
    });

    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.currentLocation = [144, -122];
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        iq.flushReverse([144, -122]);
        gov.expectPoints([144, -122]);
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getNightBoxes()[0]).toEqual([
          342066821989, 342105060171,
        ]);

        jasmine.clock().mockDate(new Date('1980-11-05T15:00:00.000Z'));
        new GraphStoreHarness(ctx).triggerAnnotationUpdate();
        expect(graphState.getNightBoxes()[0]).toEqual([
          342153281946, 342191404335,
        ]);
      });
    });
  });

  describe('now line', () => {
    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.run(() => {
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getNowLine()).toEqual(342198000000);

        ctx.tick(1, 'min');
        expect(graphState.getNowLine()).toEqual(342198060000);
      });
    });
  });

  describe('range', () => {
    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.run(() => {
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getRange()).toEqual([342192600000, 342279000000]);

        ctx.tick(1, 'min');
        expect(graphState.getRange()).toEqual([342192660000, 342279060000]);
      });
    });
  });

  describe('boundary', () => {
    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.run(() => {
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getBoundaries()).toEqual([
          342111600000, 342889200000,
        ]);

        ctx.tick(1, 'min');
        expect(graphState.getBoundaries()).toEqual([
          342111660000, 342889260000,
        ]);
      });
    });
  });
});
