import { computed, Signal } from '@angular/core';
import { ReadonlyStore, Store } from '@s-libs/signal-store';

export function storeToSignal<T>(
  store: ReadonlyStore<T> | Store<T>,
): Signal<T> {
  return computed(() => store.state);
}
