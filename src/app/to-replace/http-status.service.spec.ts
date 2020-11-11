import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  HttpStatusService,
  provideHttpStatus,
} from 'app/to-replace/http-status.service';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { expectSingleCallAndReset } from '@s-libs/ng-dev';

class Context extends AngularContext {
  constructor() {
    super({
      imports: [HttpClientTestingModule],
      providers: [provideHttpStatus()],
    });
  }
}

describe('HttpStatusService', () => {
  let ctx: Context;
  let http: HttpClient;
  let status: HttpStatusService;
  let httpController: HttpTestingController;
  let inFlight: jasmine.Spy;
  beforeEach(() => {
    ctx = new Context();

    http = ctx.inject(HttpClient);
    status = ctx.inject(HttpStatusService);
    httpController = ctx.inject(HttpTestingController);
    inFlight = jasmine.createSpy();

    status.hasInFlightRequest$.subscribe(inFlight);
    expectSingleCallAndReset(inFlight, false);
  });

  it('tracks in flight requests', () => {
    ctx.run(() => {
      http.get('url1').subscribe();
      expectSingleCallAndReset(inFlight, true);
      http.get('url2').subscribe();
      http.get('url3').subscribe();

      httpController.expectOne('url1').flush('');
      httpController.expectOne('url3').flush('');
      expect(inFlight).not.toHaveBeenCalled();
      httpController.expectOne('url2').flush('');
      expectSingleCallAndReset(inFlight, false);

      http.get('url4').subscribe();
      expectSingleCallAndReset(inFlight, true);
      httpController.expectOne('url4').flush('');
      expectSingleCallAndReset(inFlight, false);
    });
  });

  it('handles errors', () => {
    ctx.run(() => {
      http.get('url1').subscribe({ error(): void {} });
      expectSingleCallAndReset(inFlight, true);
      httpController
        .expectOne('url1')
        .flush('', { status: 500, statusText: '' });
      expectSingleCallAndReset(inFlight, false);
    });
  });

  it('handles cancelled requests (with a timeout workaround :( )', () => {
    ctx.run(() => {
      const subscription = http.get('url1').subscribe();
      expectSingleCallAndReset(inFlight, true);
      subscription.unsubscribe();
      expect(httpController.expectOne('url1').cancelled).toBe(true);

      ctx.tick(10000); // boooo workaround

      expectSingleCallAndReset(inFlight, false);
    });
  });
});
