import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { noop, once } from '@s-libs/micro-dash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

export function provideHttpStatus(): Provider {
  return {
    provide: HTTP_INTERCEPTORS,
    useExisting: HttpStatusService,
    multi: true,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpStatusService implements HttpInterceptor {
  hasInFlightRequest$: Observable<boolean>;
  private count$ = new BehaviorSubject(0);

  constructor() {
    this.hasInFlightRequest$ = this.count$.pipe(
      map(Boolean),
      distinctUntilChanged(),
    );
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.count$.next(this.count$.getValue() + 1);
    const finish = once(() => {
      this.count$.next(this.count$.getValue() - 1);
      clearInterval(timeoutId);
    });
    // would love not to have the timeout workaround :(. Using an interval to
    // avoid "pending timeout" errors in tests.
    // https://github.com/angular/angular/issues/22324
    const timeoutId = setInterval(finish, 10000);
    return next.handle(req).pipe(tap(noop, finish, finish));
  }
}
