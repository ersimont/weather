import { AppComponentHarness } from 'app/app.component.harness';
import { InitServiceHarness } from 'app/misc-services/init.service.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('InitService', () => {
  let ctx: WeatherGraphContext;
  let init: InitServiceHarness;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ init, iq } = ctx.harnesses);
  });

  it('asks for location when none is selected', () => {
    ctx.run({ useInitialState: false }, () => {
      expect(ctx.getHarness(AppComponentHarness).isSidenavOpen()).toBe(true);
      expect(ctx.getHarness(LocationOptionsComponentHarness).isExpanded()).toBe(
        true,
      );

      ctx.tick(1999);
      init.expectNoPrompt();
      ctx.tick(1);
      init.expectPrompt();
    });
  });

  it('does not ask for location when current is selected', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run({ useInitialState: true }, () => {
      iq.expectReverse();

      expect(ctx.getHarness(AppComponentHarness).isSidenavOpen()).toBe(false);
      expect(ctx.getHarness(LocationOptionsComponentHarness).isExpanded()).toBe(
        false,
      );

      ctx.tick(2000);
      init.expectNoPrompt();
    });
  });

  it('does not ask for location when a custom one has been entered', () => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'Entered';
    ctx.run({ useInitialState: true }, () => {
      iq.expectForward('Entered');

      expect(ctx.getHarness(AppComponentHarness).isSidenavOpen()).toBe(false);
      expect(ctx.getHarness(LocationOptionsComponentHarness).isExpanded()).toBe(
        false,
      );

      ctx.tick(2000);
      init.expectNoPrompt();
    });
  });
});
