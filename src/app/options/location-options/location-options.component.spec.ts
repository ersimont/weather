import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('LocationOptionsComponent', () => {
  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq } = ctx.harnesses);
  });

  it('updates the radio button when entering a new location', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(async () => {
      const location = await ctx.getHarness(LocationOptionsComponentHarness);
      await location.ensureExpanded();
      expect(await location.getSelected()).toBe('Current');
      iq.expectReverse();

      await location.setCustomLocation('Select Me');
      expect(await location.getSelected()).toBe('Custom');
      iq.expectForward('Select Me');
    });
  });
});
