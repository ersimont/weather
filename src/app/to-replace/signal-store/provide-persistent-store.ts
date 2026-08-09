import {
  computed,
  EnvironmentProviders,
  Provider,
  Signal,
  Type,
} from '@angular/core';
import { VersionedObject } from '@s-libs/js-core';
import { Store } from '@s-libs/signal-store';
import {
  PersistenceConfig,
  providePersistence,
} from 'app/to-replace/ng-core/provide-persistence';

export interface PersistentStoreConfig<
  S,
  P extends VersionedObject = VersionedObject,
> extends Omit<PersistenceConfig<S, P>, 'hydrate'> {
  type: Type<Store<S>>;
}

/**
 * Note that you must not inject `config.type` during app initialization.
 */
export function providePersistentStore<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistentStoreConfig<S, P>): Array<Provider | EnvironmentProviders> {
  let store: Store<S>;
  return [
    providePersistence({
      ...config,
      hydrate: (state: S): Signal<S> => {
        store = new config.type(state);
        return computed(() => store.state);
      },
    }),
    // TODO: friendly error message if injected before initialized?
    { provide: config.type, useFactory: () => store },
  ];
}
