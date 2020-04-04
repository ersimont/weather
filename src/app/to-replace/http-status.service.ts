import {
  HTTP_INTERCEPTORS,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable, Provider } from "@angular/core";
import { noop } from "micro-dash";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";

export function provideHttpStatus(): Provider {
  return {
    provide: HTTP_INTERCEPTORS,
    useExisting: HttpStatusService,
    multi: true,
  };
}

@Injectable({ providedIn: "root" })
export class HttpStatusService implements HttpInterceptor {
  hasInFlightRequest$: Observable<boolean>;
  private count$ = new BehaviorSubject(0);

  constructor() {
    this.hasInFlightRequest$ = this.count$.pipe(
      map(Boolean),
      distinctUntilChanged(),
    );
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.count$.next(this.count$.getValue() + 1);
    const finish = () => {
      this.count$.next(this.count$.getValue() - 1);
    };
    return next.handle(req).pipe(tap(noop, finish, finish));
  }
}
