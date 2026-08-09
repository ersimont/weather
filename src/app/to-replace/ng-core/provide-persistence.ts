import {
  effect,
  EnvironmentProviders,
  inject,
  Injector,
  provideAppInitializer,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { identity } from '@s-libs/micro-dash';
import { AsyncPersistence } from 'app/to-replace/js-core/persistence/async-persistence';
import {
  Migrations,
  VersionedObject,
} from 'app/to-replace/js-core/persistence/migrations';

export interface PersistenceConfig<
  S,
  P extends VersionedObject = VersionedObject,
> {
  dbName: string;
  buildDefaultState: () => S;
  hydrate: (initialState: S) => Signal<S>;
  migrations?: Migrations<P>;
  codec?: PersistenceCodec<S, P>;
  onPreHydrateError?: (err: unknown, persistedState?: P) => S;
}

export function providePersistence<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistenceConfig<S, P>): EnvironmentProviders {
  return provideAppInitializer(async () => {
    const injector = inject(Injector);
    const codec = config.codec ?? identityCodec;
    let persistence: AsyncPersistence<P>;
    let persisted: P | undefined;
    let initialState: S;
    try {
      persistence = new AsyncPersistence<P>(config.dbName);
      persisted = await persistence.get();

      if (persisted && config.migrations) {
        persisted = config.migrations.run(persisted);
      }
      if (persisted) {
        initialState = codec.decode(persisted);
      } else {
        initialState = config.buildDefaultState();
      }
    } catch (e) {
      if (config.onPreHydrateError) {
        initialState = config.onPreHydrateError(e, persisted);
      } else {
        console.error('Error getting initial state - using default', e);
        initialState = config.buildDefaultState();
      }
    }

    runInInjectionContext(injector, () => {
      const toPersist = config.hydrate(initialState);
      effect(() => {
        persistence.put(codec.encode(toPersist()));
      });
    });
  });
}

export interface PersistenceCodec<State, Persisted> {
  /**
   * Convert from the format that is kept in the store to what is persisted.
   */
  encode: (state: State) => Persisted;

  /**
   * Convert from the format that is persisted to what is kept in the store.
   */
  decode: (persisted: Persisted) => State;
}

const identityCodec: PersistenceCodec<any, any> = {
  decode: identity,
  encode: identity,
};
