import { HttpTestingController } from '@angular/common/http/testing';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { convertTime } from '@s-libs/js-core';

const refreshInterval = convertTime(30, 'min', 'ms');

describe('RefreshService', () => {
  let ctx: WeatherGraphContext;
  let http: HttpTestingController;
  let events: EventTrackingServiceHarness;
  let iq: LocationIqServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    http = ctx.inject(HttpTestingController);
    ({ events, iq } = ctx.harnesses);
  });

  it('refreshes after 30 minutes, with an event', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(() => {
      iq.expectReverse();

      ctx.tick(refreshInterval - 1);
      http.verify();
      expect(events.getEvents('interval_refresh').length).toBe(0);

      ctx.tick(1);
      iq.expectReverse();
      expect(events.getEvents('interval_refresh').length).toBe(1);
    });
  });

  it('resets the refresh interval after any other refresh', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(async () => {
      iq.expectReverse();

      ctx.tick(refreshInterval / 2);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      iq.expectForward('loc1');

      ctx.tick(refreshInterval - 1);
      http.verify();
      ctx.tick(1);
      iq.expectForward('loc1');

      ctx.isPageVisibleHarness.setVisible(false);
      ctx.tick(1.3 * refreshInterval);
      ctx.isPageVisibleHarness.setVisible(true);
      iq.expectForward('loc1');

      ctx.tick(refreshInterval - 1);
      http.verify();
      ctx.tick(1);
      iq.expectForward('loc1');
    });
  });

  it('allows a location refresh during cooldown', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(async () => {
      iq.expectReverse();

      ctx.tick(refreshInterval / 2);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      iq.expectForward('loc1');
    });
  });

  it('forbids focus refreshes during cooldown', () => {
    ctx.initialState.useCurrentLocation = true;
    ctx.run(() => {
      iq.expectReverse();

      ctx.tick(refreshInterval / 2);
      ctx.isPageVisibleHarness.setVisible(false);
      ctx.isPageVisibleHarness.setVisible(true);
      http.verify();
      expect().nothing();
    });
  });

  it('refreshes when the tab becomes visible, with an event', () => {
    ctx.isPageVisibleHarness.setVisible(false);
    ctx.initialState.useCurrentLocation = true;
    ctx.run(() => {
      http.verify();
      expect(events.getEvents('focus_refresh').length).toBe(0);

      ctx.isPageVisibleHarness.setVisible(true);
      iq.expectReverse();
      expect(events.getEvents('focus_refresh').length).toBe(1);
    });
  });

  it('only refreshes when the tab is visible', () => {
    ctx.isPageVisibleHarness.setVisible(false);
    ctx.initialState.useCurrentLocation = true;
    ctx.run(async () => {
      ctx.tick(refreshInterval);
      const locationOptions = await ctx.getHarness(
        LocationOptionsComponentHarness,
      );
      await locationOptions.setCustomLocation('loc1');
      http.verify();
      expect().nothing();
    });
  });
});
