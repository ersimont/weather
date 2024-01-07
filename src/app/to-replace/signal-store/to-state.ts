import { DestroyRef, effect, inject, Injector, untracked } from '@angular/core';
import { bindKey } from '@s-libs/micro-dash';
import { Store } from '@s-libs/signal-store';
import { BehaviorSubject, Observable } from 'rxjs';

export function toState$<T>(
  store: Store<T>,
  injector?: Injector,
): Observable<T> {
  injector ??= inject(Injector);
  const subject = new BehaviorSubject<T>(store.state);
  let firstEffect = true;
  effect(
    () => {
      const { state } = store;
      untracked(() => {
        if (firstEffect) {
          firstEffect = false;
        } else {
          subject.next(state);
        }
      });
    },
    { injector },
  );
  injector.get(DestroyRef).onDestroy(bindKey(subject, 'complete'));
  return subject.asObservable();
}
