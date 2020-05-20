import { AppComponentHarness } from 'app/app.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('InitService', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq } = ctx.harnesses);
  });

  it('asks for location when none is selected', () => {
    ctx.run({ useInitialState: false }, () => {
      expect(ctx.getHarness(AppComponentHarness).isSidenavOpen()).toBe(true);
      expect(ctx.getHarness(LocationOptionsComponentHarness).isExpanded()).toBe(
        true,
      );

      ctx.tick(1999);
      ctx.expectNoErrorShown();
      ctx.tick(1);
      ctx.expectErrorShown('Choose a location'); // TODO: not an error!
    });
  });

  it('does not ask for location when one is selected', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run({ useInitialState: true }, () => {
      iq.expectReverse();

      expect(ctx.getHarness(AppComponentHarness).isSidenavOpen()).toBe(false);
      expect(ctx.getHarness(LocationOptionsComponentHarness).isExpanded()).toBe(
        false,
      );

      ctx.tick(2000);
      ctx.expectNoErrorShown(); // TODO: not an error!
    });
  });
});
