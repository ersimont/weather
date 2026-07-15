import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { MixpanelServiceHarness } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';

describe('AbstractOptionDirective', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('fires a close event', async () => {
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.collapse();
      await events.expectOne('close_location_options', {
        category: 'navigate',
      });
    });
  });

  it('fires an open event', async () => {
    await ctx.run(async () => {
      const events = new MixpanelServiceHarness();
      const locationOptions = await ctx.getHarness(UnitOptionsComponentHarness);
      await locationOptions.expand();
      await events.expectOne('open_unit_options', { category: 'navigate' });
    });
  });
});
