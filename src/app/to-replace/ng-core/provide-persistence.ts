import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
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
import { debounceWhileHandling } from './debounce-while-handling';

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
  onSaveError?: (err: unknown) => void;
}

export const BACKEND = new InjectionToken<AsyncPersistence<any>>(
  'persistence backend',
);

export function providePersistence<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistenceConfig<S, P>): EnvironmentProviders {
  const backend = new AsyncPersistence<P>(config.dbName);
  return makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const p = new Persister<S, P>(config, backend);
      const signal = await p.hydrate();
      p.persist(signal);
    }),
    { provide: BACKEND, useValue: backend },
  ]);
}

class Persister<S, P extends VersionedObject> {
  #injector = inject(Injector);
  #codec: PersistenceCodec<S, P>;

  constructor(
    private config: PersistenceConfig<S, P>,
    private backend: AsyncPersistence<P>,
  ) {
    this.#codec = this.#resolve(config.codec ?? identityCodec);
  }

  async hydrate(): Promise<Signal<S>> {
    let persisted: P | undefined;
    let initialState: S;
    try {
      persisted = await this.backend.get();

      if (persisted && this.config.migrations) {
        persisted = this.#resolve(this.config.migrations).run(persisted);
      }
      if (persisted) {
        initialState = this.#codec.decode(persisted);
      } else {
        initialState = this.#resolve(this.config.freshState);
      }
    } catch (e) {
      if (this.config.onPreHydrateError) {
        initialState = this.config.onPreHydrateError(e, persisted);
      } else {
        this.#injector.get(ErrorHandler).handleError(e);
        initialState = this.#resolve(this.config.freshState);
      }
    }
    return runInInjectionContext(this.#injector, () =>
      this.config.hydrate(initialState),
    );
  }

  persist(signal: Signal<S>): void {
    runInInjectionContext(this.#injector, () => {
      const effectRef = debounceWhileHandling(signal, async (state) => {
        try {
          await this.backend.put(this.#codec.encode(state));
        } catch (e) {
          effectRef.destroy();
          if (this.config.onSaveError) {
            this.config.onSaveError(e);
          } else {
            throw e;
          }
        }
      });
    });
  }

  #resolve<T>(maybeLazy: MaybeLazy<T>): T {
    if (typeof maybeLazy === 'function') {
      return runInInjectionContext(this.#injector, maybeLazy as () => T);
    } else {
      return maybeLazy;
    }
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
