import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function trackHttpStatus(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const service = inject(HttpStatusService);
  service.changeInFlight(1);
  const finish = (): void => {
    service.changeInFlight(-1);
  };
  return next(req).pipe(
    tap({ error: finish, complete: finish, unsubscribe: finish }),
  );
}

@Service()
export class HttpStatusService {
  readonly hasInFlightRequest = computed(() => this.#count() > 0);
  readonly #count = signal(0);

  changeInFlight(delta: number): void {
    this.#count.update((count) => count + delta);
  }
}
