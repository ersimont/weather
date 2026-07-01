import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/mixpanel-core/event-tracking.service.harness';

const { refreshMillis } = environment;

describe('RefreshService', () => {
  let ctx: WeatherGraphContext;
  let http: HttpTestingController;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    http = ctx.inject(HttpTestingController);
    ({ iq } = ctx.harnesses);
  });

  it('refreshes periodically, with an event', async () => {
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      const events = new EventTrackingServiceHarness();
      iq.expectReverse();

      await ctx.tick(refreshMillis - 1);
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

  it('gives a little wiggle room to the cooldown', async () => {
    // When the cooldown exactly matched `refreshMillis`, then in real life it would often skip every other refresh. E.g. if delay between firing the interval and triggering the throttle is a little quicker this time, it'll run into the throttle.
    ctx.initialState.useCurrentLocation = true;
    await ctx.run(async () => {
      iq.expectReverse();

      await ctx.tick(refreshMillis - 100);
      await ctx.isPageVisibleHarness.setVisible(false);
      await ctx.isPageVisibleHarness.setVisible(true);
      iq.expectReverse();
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
