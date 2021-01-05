import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('LocationIqService', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  let iq: LocationIqServiceHarness;
  let refresh: RefreshServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, iq, refresh } = ctx.harnesses);
  });

  describe('.forward()', () => {
    it('handles an error', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'bad';
      ctx.run(() => {
        iq.expectForward('bad').flushError();
        errors.expectGeneric();

        refresh.trigger();
        iq.expectForward('bad');
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'oops';
      ctx.run(async () => {
        const locationOptions = await ctx.getHarness(
          LocationOptionsComponentHarness,
        );
        await locationOptions.select('Current');
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
        errors.expectGeneric();

        refresh.trigger();
        iq.expectReverse();
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = true;
      ctx.run(async () => {
        const location = await ctx.getHarness(LocationOptionsComponentHarness);
        await location.setCustomLocation('New place');
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
        errors.expectGeneric();

        refresh.trigger();
        iq.expectTimezone([6, 1]);
      });
    });

    it('can cancel', () => {
      ctx.initialState.useCurrentLocation = false;
      ctx.initialState.customLocation.search = 'oops';
      ctx.run(async () => {
        iq.expectForward('oops').flush([
          iq.buildLocationResponse({ lat: '6', lon: '1' }),
        ]);
        const locationOptions = await ctx.getHarness(
          LocationOptionsComponentHarness,
        );
        await locationOptions.select('Current');
        expect(iq.expectTimezone([6, 1]).isCancelled()).toBe(true);
        iq.expectReverse();
      });
    });
  });
});
