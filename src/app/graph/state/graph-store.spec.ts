import { tick } from '@angular/core/testing';
import { GraphStateHarness } from 'app/graph/state/graph-state.harness';
import { GraphStoreHarness } from 'app/graph/state/graph-store.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
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

  describe('night boxing', () => {
    it('updates with location', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.currentLocation = [144, -122];
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        iq.flushReverse([144, -122]);
        gov.expectPoints([144, -122]);
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getNightBoxes()[0]).toEqual({
          from: 342066821989,
          to: 342105060171,
        });

        ctx.currentLocation = [10, -20];
        refresh.trigger();
        iq.flushReverse([10, -20]);
        gov.expectPoints([10, -20]);
        expect(graphState.getNightBoxes()[0]).toEqual({
          from: 342039449477,
          to: 342083544424,
        });
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
        expect(graphState.getNightBoxes()[0]).toEqual({
          from: 342066821989,
          to: 342105060171,
        });

        jasmine.clock().mockDate(new Date('1980-11-05T15:00:00.000Z'));
        new GraphStoreHarness(ctx).triggerAnnotationUpdate();
        expect(graphState.getNightBoxes()[0]).toEqual({
          from: 342153281946,
          to: 342191404335,
        });
      });
    });
  });

  describe('now line', () => {
    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.run(() => {
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getNowLine()).toEqual(342198000000);

        tick(60000);
        expect(graphState.getNowLine()).toEqual(342198060000);
      });
    });
  });

  describe('bounding', () => {
    it('updates with time', () => {
      ctx.startTime = new Date('1980-11-04T15:00:00.000Z');
      ctx.run(() => {
        const graphState = new GraphStateHarness(ctx);
        expect(graphState.getBoundaries()).toEqual({
          min: 342111600000,
          max: 342889200000,
        });

        tick(60000);
        expect(graphState.getBoundaries()).toEqual({
          min: 342111660000,
          max: 342889260000,
        });
      });
    });
  });
});
