import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { logValues } from '@s-libs/rxjs-core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

export function trackHttpStatus(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const service = inject(HttpStatusService);
  service.changeInFlight(1);
  const finish = () => {
    service.changeInFlight(-1);
  };
  return next(req).pipe(
    tap({ error: finish, complete: finish, unsubscribe: finish }),
  );
}

@Injectable({ providedIn: 'root' })
export class HttpStatusService {
  hasInFlightRequest$: Observable<boolean>;
  #count$ = new BehaviorSubject(0);

  constructor() {
    this.hasInFlightRequest$ = this.#count$.pipe(
      map(Boolean),
      distinctUntilChanged(),
      logValues(),
    );
  }

  changeInFlight(delta: number): void {
    this.#count$.next(this.#count$.getValue() + delta);
  }
}
