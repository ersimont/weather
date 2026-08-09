import {
  inject,
  PLATFORM_ID,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { AngularContext } from '@s-libs/ng-vitest';
import { AsyncPersistence } from 'app/to-replace/js-core/persistence/async-persistence';
import {
  Migrations,
  VersionedObject,
} from 'app/to-replace/js-core/persistence/migrations';
import {
  PersistenceConfig,
  providePersistence,
} from 'app/to-replace/ng-core/provide-persistence';

describe('providePersistence()', () => {
  class CounterState {
    _version = 1;

    constructor(public count = 0) {}
  }

  class CounterContext<
    P extends VersionedObject = CounterState,
  > extends AngularContext {
    signal!: WritableSignal<CounterState>;

    constructor(config: Partial<PersistenceConfig<CounterState, P>>) {
      const fullConfig: PersistenceConfig<CounterState, P> = {
        dbName: 'theKey',
        buildDefaultState: () => new CounterState(),
        hydrate: (initialState) => {
          this.signal = signal(initialState);
          return this.signal;
        },
        ...config,
      };
      super({ providers: [providePersistence(fullConfig)] });
    }
  }

  const persistence = new AsyncPersistence('theKey');
  beforeEach(async () => {
    await persistence.clear();
  });

  describe('starter simplest form', () => {
    let ctx: CounterContext;
    beforeEach(async () => {
      ctx = new CounterContext({});
    });

    it('builds the default when nothing is saved', async () => {
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    // I went back & forth on whether to save the initial state. I think it's useful so that callers can use `buildDefaultState()` as an indication that it's a brand-new user who has never visited the page before.
    it('persists changes, including initial state', async () => {
      await ctx.run(async () => {
        await ctx.tick();
        expect(await persistence.get()).toEqual(new CounterState());

        const newState = { _version: 1, count: 1 };
        ctx.signal.set(newState);
        await ctx.tick();
        expect(await persistence.get()).toEqual(newState);
      });
    });

    it('hydrates with saved state', async () => {
      const persisted = { _version: 1, count: 8 };
      await persistence.put(persisted);
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(persisted);
      });
    });
  });

  it('allows injecting dependencies in `hydrate`', async () => {
    let injected: unknown;
    const ctx = new CounterContext({
      hydrate: (): Signal<CounterState> => {
        injected = inject(PLATFORM_ID);
        return signal(new CounterState());
      },
    });
    await ctx.run(() => {
      expect(injected).toBeDefined();
    });
  });

  describe('migrations', () => {
    let ctx: CounterContext;
    beforeEach(() => {
      const migrations = new Migrations<CounterState>(2);
      migrations.register(1, (state) => ({ ...state, _version: 2 }));
      ctx = new CounterContext({ migrations });
    });

    it('runs when needed', async () => {
      await persistence.put(new CounterState());
      await ctx.run(async () => {
        expect(ctx.signal()._version).toBe(2);
      });
    });

    it('is OK with no persisted state', async () => {
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });
  });

  describe('codec', () => {
    interface Persisted {
      _version: number;
      COUNT: number;
    }

    let ctx: CounterContext<Persisted>;
    beforeEach(() => {
      ctx = new CounterContext({
        codec: {
          encode: (state: CounterState): Persisted => ({
            _version: state._version,
            COUNT: state.count,
          }),
          decode: (persisted: Persisted): CounterState => ({
            _version: persisted._version,
            count: persisted.COUNT,
          }),
        },
      });
    });

    it('decodes', async () => {
      await persistence.put({ _version: 1, COUNT: 1 });
      await ctx.run(async () => {
        await ctx.tick();
        expect(ctx.signal()).toEqual({ _version: 1, count: 1 });
      });
    });

    it('encodes', async () => {
      await ctx.run(async () => {
        ctx.signal.set({ _version: 1, count: 1 });
        await ctx.tick();
        expect(await persistence.get()).toEqual({ _version: 1, COUNT: 1 });
      });
    });

    it('is OK with no persisted state', async () => {
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });
  });

  describe('onPreHydrateError', () => {
    class ErrorContext extends CounterContext {
      migrationError = new Error();

      constructor(
        config: Partial<PersistenceConfig<CounterState, CounterState>>,
      ) {
        const migrations = new Migrations<CounterState>(2);
        migrations.register(1, () => {
          throw this.migrationError;
        });
        super({ migrations, ...config });
      }
    }

    beforeEach(async () => {
      await persistence.put(new CounterState());
    });

    it('logs and uses default state by when undefined', async () => {
      const error = vi.spyOn(console, 'error');
      const ctx = new ErrorContext({});
      await ctx.run(async () => {
        expect(error).toHaveBeenCalledExactlyOnceWith(
          'Error getting initial state - using default',
          ctx.migrationError,
        );
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('receives the thrown error and persisted object', async () => {
      const onError = vi.fn();
      const ctx = new ErrorContext({ onPreHydrateError: onError });
      await ctx.run(async () => {
        expect(onError).toHaveBeenCalledExactlyOnceWith(
          ctx.migrationError,
          new CounterState(),
        );
      });
    });

    it('can be overridden to return the new final state', async () => {
      const newState = new CounterState(3);
      const ctx = new ErrorContext({
        onPreHydrateError: (): CounterState => newState,
      });
      await ctx.run(async () => {
        expect(ctx.signal()).toBe(newState);
      });
    });

    it('has no effect when there is no error', async () => {
      const onError = vi.fn();
      const ctx = new ErrorContext({
        onPreHydrateError: onError,
        migrations: undefined,
      });
      await ctx.run(async () => {
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });
});
