import { HttpTestingController } from '@angular/common/http/testing';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { refreshMillis } from 'app/misc-services/refresh.service';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/mixpanel-core/event-tracking.service.harness';

describe('RefreshService', () => {
  let ctx: WeatherGraphContext;
  let http: HttpTestingController;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    http = ctx.inject(HttpTestingController);
    ({ iq } = ctx.harnesses);
  });

  it('refreshes after 30 minutes, with an event', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      iq.expectReverse();

      console.log('--------------');
      await ctx.tick(refreshMillis - 1);
      console.log('--------------');
      http.verify();
      expect(events.getEvents('interval_refresh').length).toBe(0);

      await ctx.tick(1);
      iq.expectReverse();
      expect(events.getEvents('interval_refresh').length).toBe(1);
    });
  });

  it('resets the refresh interval after any other refresh', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      await ctx.tick(refreshMillis / 2);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      iq.expectForward('loc1');

      await ctx.tick(refreshMillis - 1);
      http.verify();
      await ctx.tick(1);
      iq.expectForward('loc1');

      await ctx.isPageVisibleHarness.setVisible(false);
      await ctx.tick(1.3 * refreshMillis);
      await ctx.isPageVisibleHarness.setVisible(true);
      iq.expectForward('loc1');

      await ctx.tick(refreshMillis - 1);
      http.verify();
      await ctx.tick(1);
      iq.expectForward('loc1');
    });
  });

  it('allows a location refresh during cooldown', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      await ctx.tick(refreshMillis / 2);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      iq.expectForward('loc1');
    });
  });

  it('forbids focus refreshes during cooldown', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      await ctx.tick(refreshMillis / 2);
      await ctx.isPageVisibleHarness.setVisible(false);
      await ctx.isPageVisibleHarness.setVisible(true);
      http.verify();
    });
  });

  it('refreshes when the tab becomes visible, with an event', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.isPageVisibleHarness.setVisible(false);
    await ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      http.verify();
      expect(events.getEvents('focus_refresh').length).toBe(0);

      await ctx.isPageVisibleHarness.setVisible(true);
      iq.expectReverse();
      expect(events.getEvents('focus_refresh').length).toBe(1);
    });
  });

  it('only refreshes when the tab is visible', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.isPageVisibleHarness.setVisible(false);
    await ctx.run(async () => {
      await ctx.tick(refreshMillis);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      http.verify();
    });
  });
});
