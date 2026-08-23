import {
  effect,
  EnvironmentProviders,
  ErrorHandler,
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

type MaybeLazy<T> = T | (() => T);

export interface PersistenceConfig<
  S,
  P extends VersionedObject = VersionedObject,
> {
  dbName: string;
  freshState: MaybeLazy<S>;
  hydrate: (initialState: S) => Signal<S>;
  migrations?: MaybeLazy<Migrations<P>>;
  codec?: MaybeLazy<PersistenceCodec<S, P>>;
  onPreHydrateError?: (err: unknown, persistedState?: P) => S;
}

export function providePersistence<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistenceConfig<S, P>): EnvironmentProviders {
  return provideAppInitializer(async () => {
    const injector = inject(Injector);
    const codec = resolve(config.codec ?? identityCodec, injector);
    let persistence: AsyncPersistence<P>;
    let persisted: P | undefined;
    let initialState: S;
    try {
      persistence = new AsyncPersistence<P>(config.dbName);
      persisted = await persistence.get();

      if (persisted && config.migrations) {
        persisted = resolve(config.migrations, injector).run(persisted);
      }
      if (persisted) {
        initialState = codec.decode(persisted);
      } else {
        initialState = resolve(config.freshState, injector);
      }
    } catch (e) {
      if (config.onPreHydrateError) {
        initialState = config.onPreHydrateError(e, persisted);
      } else {
        injector.get(ErrorHandler).handleError(e);
        initialState = resolve(config.freshState, injector);
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

function resolve<T>(maybeLazy: MaybeLazy<T>, injector: Injector): T {
  if (typeof maybeLazy === 'function') {
    return runInInjectionContext(injector, maybeLazy as () => T);
  } else {
    return maybeLazy;
  }
}

export interface PersistenceCodec<State, Persisted> {
  /**
   * Convert from the format that is kept in the store to what is persisted.
   */
  encode: (decoded: State) => Persisted;

  /**
   * Convert from the format that is persisted to what is kept in the store.
   */
  decode: (encoded: Persisted) => State;
}

const identityCodec: PersistenceCodec<any, any> = {
  decode: identity,
  encode: identity,
};
