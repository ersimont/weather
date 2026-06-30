import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { noop } from '@s-libs/micro-dash';
import { AngularContext } from '@s-libs/ng-vitest';
import {
  HttpStatusService,
  trackHttpStatus,
} from 'app/to-replace/http-status.service';

class TestContext extends AngularContext {
  constructor() {
    super({
      providers: [provideHttpClient(withInterceptors([trackHttpStatus]))],
    });
  }
}

describe('HttpStatusService', () => {
  let ctx: TestContext;
  let http: HttpClient;
  let status: HttpStatusService;
  let controller: HttpTestingController;
  beforeEach(() => {
    ctx = new TestContext();
    http = ctx.inject(HttpClient);
    status = ctx.inject(HttpStatusService);
    controller = ctx.inject(HttpTestingController);
  });

  it('tracks in flight requests', async () => {
    await ctx.run(() => {
      http.get('url1').subscribe();
      expect(status.hasInFlightRequest()).toBe(true);
      http.get('url2').subscribe();
      http.get('url3').subscribe();

      controller.expectOne('url1').flush('');
      controller.expectOne('url3').flush('');
      expect(status.hasInFlightRequest()).toBe(true);
      controller.expectOne('url2').flush('');
      expect(status.hasInFlightRequest()).toBe(false);

      http.get('url4').subscribe();
      expect(status.hasInFlightRequest()).toBe(true);
      controller.expectOne('url4').flush('');
      expect(status.hasInFlightRequest()).toBe(false);
    });
  });

  it('handles errors', async () => {
    await ctx.run(() => {
      http.get('url1').subscribe({ error: noop });
      expect(status.hasInFlightRequest()).toBe(true);
      controller.expectOne('url1').flush('', { status: 500, statusText: '' });
      expect(status.hasInFlightRequest()).toBe(false);
    });
  });

  it('handles cancelled requests', async () => {
    await ctx.run(() => {
      const subscription = http.get('url1').subscribe();
      expect(status.hasInFlightRequest()).toBe(true);
      subscription.unsubscribe();
      expect(controller.expectOne('url1').cancelled).toBe(true); // sanity check
      expect(status.hasInFlightRequest()).toBe(false);
    });
  });
});
