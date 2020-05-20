import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('LocationIqService', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, refresh } = ctx.harnesses);
  });

  describe('.forward()', () => {
    it('handles an error', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'bad';
      ctx.run(() => {
        iq.expectForward('bad').flushError();

        refresh.trigger();
        iq.expectForward('bad');
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'oops';
      ctx.run(() => {
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        expect(iq.expectForward('oops').isCancelled()).toBe(true);
        iq.expectReverse();
      });
    });
  });

  describe('.reverse()', () => {
    it('handles an error', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        iq.expectReverse().flushError();

        refresh.trigger();
        iq.expectReverse();
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        const location = ctx.getHarness(LocationOptionsComponentHarness);
        location.setCustomLocation('New place');
        expect(iq.expectReverse().isCancelled()).toBe(true);
        iq.expectForward('New place');
      });
    });
  });

  describe('.timezone()', () => {
    it('handles an error', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'bad';
      ctx.run(() => {
        iq.expectForward('bad').flush([
          iq.buildLocationResponse({ lat: '6', lon: '1' }),
        ]);
        iq.expectTimezone([6, 1]).flushError();

        refresh.trigger();
        iq.expectForward('bad');
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'oops';
      ctx.run(() => {
        iq.expectForward('oops').flush([
          iq.buildLocationResponse({ lat: '6', lon: '1' }),
        ]);
        ctx.getHarness(LocationOptionsComponentHarness).select('Current');
        expect(iq.expectTimezone([6, 1]).isCancelled()).toBe(true);
        iq.expectReverse();
      });
    });
  });
});
