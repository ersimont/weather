import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  InjectionToken,
  Injector,
  provideAppInitializer,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { identity } from '@s-libs/micro-dash';
import { AsyncPersistence } from '../js-core/persistence/async-persistence';
import { Migrations, VersionedObject } from '../js-core/persistence/migrations';
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

export const BACKEND_FACTORY = new InjectionToken(
  'persistence backend factory',
  {
    factory:
      () =>
      (dbName: string): AsyncPersistence<any> =>
        new AsyncPersistence(dbName),
  },
);

export function providePersistence<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistenceConfig<S, P>): EnvironmentProviders {
  return provideAppInitializer(async () => {
    const p = new Persister<S, P>(config);
    const signal = await p.hydrate();
    p.persist(signal);
  });
}

class Persister<S, P extends VersionedObject> {
  #backend: AsyncPersistence<P>;
  #injector = inject(Injector);
  #codec: PersistenceCodec<S, P>;

  constructor(private config: PersistenceConfig<S, P>) {
    this.#backend = inject(BACKEND_FACTORY)(config.dbName);
    this.#codec = this.#resolve(config.codec ?? identityCodec);
  }

  async hydrate(): Promise<Signal<S>> {
    let persisted: P | undefined;
    let initialState: S;
    try {
      persisted = await this.#backend.get();

      if (persisted && this.config.migrations) {
        persisted = this.#resolve(this.config.migrations).run(persisted);
      }
      if (persisted) {
        initialState = this.#codec.decode(persisted);
      } else {
        initialState = this.#resolve(this.config.freshState);
      }
    } catch (e) {
      this.#withInjection(() => {
        if (this.config.onPreHydrateError) {
          initialState = this.config.onPreHydrateError(e, persisted);
        } else {
          inject(ErrorHandler).handleError(e);
          initialState = this.#resolve(this.config.freshState);
        }
      });
    }
    return this.#withInjection(() => this.config.hydrate(initialState));
  }

  persist(signal: Signal<S>): void {
    this.#withInjection(() => {
      const effectRef = debounceWhileHandling(signal, async (state) => {
        try {
          await this.#backend.put(this.#codec.encode(state));
        } catch (e) {
          effectRef.destroy();
          this.#withInjection(() => {
            if (this.config.onSaveError) {
              this.config.onSaveError(e);
            } else {
              throw e;
            }
          });
        }
      });
    });
  }

  #resolve<T>(maybeLazy: MaybeLazy<T>): T {
    if (typeof maybeLazy === 'function') {
      return this.#withInjection(maybeLazy as () => T);
    } else {
      return maybeLazy;
    }
  }

  #withInjection<T>(fn: () => T): T {
    return runInInjectionContext(this.#injector, fn);
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
