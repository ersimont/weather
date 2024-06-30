import { toObservable, ToObservableOptions } from '@angular/core/rxjs-interop';
import { ReadonlyStore, Store } from '@s-libs/signal-store';
import { storeToSignal } from 'app/to-replace/signal-store/store-to-signal';
import { Observable } from 'rxjs';

export function observeStore<T>(
  store: ReadonlyStore<T> | Store<T>,
  options?: ToObservableOptions,
): Observable<T> {
  return toObservable(storeToSignal(store), options);
}
