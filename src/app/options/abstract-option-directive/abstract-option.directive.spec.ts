import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/mixpanel-core/event-tracking.service.harness';

describe('AbstractOptionDirective', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('fires a close event', () => {
    ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      await ctx.cleanUpFreshInit();

      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.collapse();
      expect(events.getEvents('close_location_options').length).toBe(1);
    });
  });

  it('fires an open event', () => {
    ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      await ctx.cleanUpFreshInit();

      const locationOptions = await ctx.getHarness(UnitOptionsComponentHarness);
      await locationOptions.expand();
      expect(events.getEvents('open_unit_options').length).toBe(1);
    });
  });
});
