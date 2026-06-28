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

  it('asks for location when none is selected', async () => {
    ctx.useInitialState = false;
    await ctx.run(async () => {
      const app = await ctx.getHarness(AppComponentHarness);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      expect(await app.isSidenavOpen()).toBe(true);
      expect(await locationOptions.isExpanded()).toBe(true);

      await ctx.tick(1999);
      await init.expectNoPrompt();
      await ctx.tick(1);
      await init.expectChooseLocationPrompt();
    });
  });

  it('does not ask for location when current is selected', async () => {
    ctx.useInitialState = true;
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      const app = await ctx.getHarness(AppComponentHarness);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      expect(await app.isSidenavOpen()).toBe(false);
      expect(await locationOptions.isExpanded()).toBe(false);

      await ctx.tick(2000);
      await init.expectNoPrompt();
    });
  });

  it('does not ask for location when a custom one has been entered', async () => {
    ctx.useInitialState = true;
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'Entered';
    await ctx.run(async () => {
      iq.expectForward('Entered');

      const app = await ctx.getHarness(AppComponentHarness);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      expect(await app.isSidenavOpen()).toBe(false);
      expect(await locationOptions.isExpanded()).toBe(false);

      await ctx.tick(2000);
      await init.expectNoPrompt();
    });
  });
});
