import { HttpTestingController } from '@angular/common/http/testing';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { convertTime } from 's-js-utils';

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

  function dispatchFocus() {
    window.dispatchEvent(new Event('focus'));
    ctx.tick();
  }

  it('refreshes after 30 minutes, with an event', () => {
    ctx.run(() => {
      ctx.tick(refreshInterval - 1);
      http.verify();
      expect(events.getEvents('interval_refresh').length).toBe(0);

      ctx.tick(1);
      iq.expectReverse();
      expect(events.getEvents('interval_refresh').length).toBe(1);
    });
  });

  it('resets the refresh interval after any other refresh', () => {
    ctx.run(() => {
      ctx.tick(refreshInterval / 2);
      ctx.getHarness(LocationOptionsComponentHarness).setCustomLocation('loc1');
      iq.expectForward('loc1');

      ctx.tick(refreshInterval - 1);
      http.verify();
      ctx.tick(1);
      iq.expectForward('loc1');

      ctx.mocks.browser.hasFocus.and.returnValue(false);
      ctx.tick(1.3 * refreshInterval);
      ctx.mocks.browser.hasFocus.and.returnValue(true);
      dispatchFocus();
      iq.expectForward('loc1');

      ctx.tick(refreshInterval - 1);
      http.verify();
      ctx.tick(1);
      iq.expectForward('loc1');
    });
  });

  it('allows a location refresh during cooldown', () => {
    ctx.run(() => {
      ctx.tick(refreshInterval / 2);
      ctx.getHarness(LocationOptionsComponentHarness).setCustomLocation('loc1');
      iq.expectForward('loc1');
    });
  });

  it('forbids focus refreshes during cooldown', () => {
    ctx.run(() => {
      ctx.tick(refreshInterval / 2);
      dispatchFocus();
      http.verify();
      expect().nothing();
    });
  });

  it('refreshes when the tab gains focus, with an event', () => {
    ctx.mocks.browser.hasFocus.and.returnValue(false);
    ctx.run({ flushDefaultRequests: false }, () => {
      http.verify();
      expect(events.getEvents('focus_refresh').length).toBe(0);

      ctx.mocks.browser.hasFocus.and.returnValue(true);
      dispatchFocus();
      iq.expectReverse();
      expect(events.getEvents('focus_refresh').length).toBe(1);
    });
  });

  it('only refreshes when the tab has focus', () => {
    ctx.mocks.browser.hasFocus.and.returnValue(false);
    ctx.run({ flushDefaultRequests: false }, () => {
      ctx.tick(refreshInterval);
      dispatchFocus();
      ctx.getHarness(LocationOptionsComponentHarness).setCustomLocation('loc1');
      http.verify();
      expect().nothing();
    });
  });
});
