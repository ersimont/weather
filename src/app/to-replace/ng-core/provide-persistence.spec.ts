import {
  ErrorHandler,
  inject,
  PLATFORM_ID,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { noop } from '@s-libs/micro-dash';
import { AngularContext, AsyncMethodController } from '@s-libs/ng-vitest';
import { AsyncPersistence } from 'app/to-replace/js-core/persistence/async-persistence';
import {
  Migrations,
  VersionedObject,
} from 'app/to-replace/js-core/persistence/migrations';
import {
  BACKEND,
  PersistenceCodec,
  PersistenceConfig,
  providePersistence,
} from './provide-persistence';

describe('providePersistence()', () => {
  class CounterState {
    _version = 1;

    constructor(public count = 0) {}
  }

  class CounterContext<
    P extends VersionedObject = CounterState,
  > extends AngularContext {
    // eslint-disable-next-line @angular-eslint/prefer-signals -- init is delayed
    signal!: WritableSignal<CounterState>;

    constructor(config: Partial<PersistenceConfig<CounterState, P>> = {}) {
      const fullConfig: PersistenceConfig<CounterState, P> = {
        dbName: 'theKey',
        freshState: new CounterState(),
        hydrate: (initialState) => {
          this.signal = signal(initialState);
          return this.signal;
        },
        ...config,
      };
      super({ providers: [providePersistence(fullConfig)] });
    }

    async setCount(value: number): Promise<void> {
      this.signal.set(new CounterState(value));
      await this.tick();
    }

    protected override async init(): Promise<void> {
      await super.init();
      await this.tick();
    }
  }

  const persistence = new AsyncPersistence('theKey');
  beforeEach(async () => persistence.clear());

  describe('persistence', () => {
    // I went back & forth on whether to save the initial state. I think it's useful so that callers can use `buildDefaultState()` as an indication that it's a brand-new user who has never visited the page before.
    it('persists changes, including initial state', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        expect(await persistence.get()).toEqual(new CounterState());

        await ctx.setCount(1);
        expect(await persistence.get()).toEqual(new CounterState(1));
      });
    });

    it('debounces saves while the previous one is pending', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.inject(BACKEND), 'put');

        await ctx.setCount(1);
        const call1 = put.expectOne([new CounterState(1)]);

        await ctx.setCount(2);
        await ctx.setCount(3);
        put.verify();

        await call1.flush();
        put.expectOne([new CounterState(3)]);
        put.verify();
      });
    });

    it('stops after error', async () => {
      window.addEventListener('unhandledrejection', noop);

      const ctx = new CounterContext();
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.inject(BACKEND), 'put');
        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error('');

        await ctx.setCount(2);
        put.verify();
      });

      window.removeEventListener('unhandledrejection', noop);
    });
  });

  describe('config.freshState', () => {
    it('used when nothing is saved', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      const state = new CounterState();
      const ctx = new CounterContext({
        freshState: (): CounterState => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return state;
        },
      });
      await ctx.run(() => {
        expect(ctx.signal()).toBe(state);
      });
    });

    it('not called when something is persisted', async () => {
      await persistence.put(new CounterState());
      const freshState = vi.fn();
      const ctx = new CounterContext({ freshState });
      await ctx.run(async () => {
        expect(freshState).not.toHaveBeenCalled();
      });
    });
  });

  describe('config.hydrate', () => {
    it('receives the persisted state', async () => {
      const persisted = new CounterState();
      await persistence.put(persisted);
      const ctx = new CounterContext();
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(persisted);
      });
    });

    it('can inject dependencies', async () => {
      const ctx = new CounterContext({
        hydrate: (): Signal<CounterState> => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return signal(new CounterState());
        },
      });
      await ctx.run(noop);
    });
  });

  describe('config.migrations', () => {
    let migrations: Migrations<CounterState>;
    beforeEach(() => {
      migrations = new Migrations<CounterState>(2);
      migrations.register(1, (state) => ({ ...state, _version: 2 }));
    });

    it('run when needed', async () => {
      await persistence.put(new CounterState());
      const ctx = new CounterContext({ migrations });
      await ctx.run(async () => {
        expect(ctx.signal()._version).toBe(2);
      });
    });

    it('is OK with no persisted state', async () => {
      const ctx = new CounterContext({ migrations });
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      await persistence.put(new CounterState());
      let injected: unknown;
      const ctx = new CounterContext({
        migrations: (): Migrations<CounterState> => {
          injected = inject(PLATFORM_ID);
          return migrations;
        },
      });
      await ctx.run(async () => {
        expect(injected).toBeDefined();
      });
    });
  });

  describe('config.codec', () => {
    interface Persisted {
      _version: number;
      COUNT: number;
    }

    let codec: PersistenceCodec<CounterState, Persisted>;
    beforeEach(() => {
      codec = {
        encode: (state: CounterState): Persisted => ({
          _version: state._version,
          COUNT: state.count,
        }),
        decode: (persisted: Persisted): CounterState => ({
          _version: persisted._version,
          count: persisted.COUNT,
        }),
      };
    });

    it('encodes', async () => {
      const ctx = new CounterContext({ codec });
      await ctx.run(async () => {
        ctx.signal.set({ _version: 1, count: 1 });
        await ctx.tick();
        expect(await persistence.get()).toEqual({ _version: 1, COUNT: 1 });
      });
    });

    it('decodes', async () => {
      await persistence.put({ _version: 1, COUNT: 1 });
      const ctx = new CounterContext({ codec });
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual({ _version: 1, count: 1 });
      });
    });

    it('is OK with no persisted state', async () => {
      const ctx = new CounterContext({ codec });
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      const ctx = new CounterContext({
        codec: (): PersistenceCodec<CounterState, Persisted> => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return codec;
        },
      });
      await ctx.run(noop);
    });
  });

  describe('config.onPreHydrateError', () => {
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

    it('when undefined, passes to error handler and uses default', async () => {
      const handleError = vi.fn();
      TestBed.overrideProvider(ErrorHandler, { useValue: { handleError } });
      const ctx = new ErrorContext({});
      await ctx.run(async () => {
        expect(handleError).toHaveBeenCalledExactlyOnceWith(ctx.migrationError);
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

  describe('config.onSaveError', () => {
    it('receives errors during save', async () => {
      const onSaveError = vi.fn(noop);
      const ctx = new CounterContext({ onSaveError });
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.inject(BACKEND), 'put');
        const theError = new Error('unique message');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error(theError);

        expect(onSaveError).toHaveBeenCalledWith(theError);
      });
    });

    it('rethrows by default', async () => {
      const unhandler = vi.fn(noop);
      window.addEventListener('unhandledrejection', unhandler);

      const ctx = new CounterContext();
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.inject(BACKEND), 'put');
        const theError = new Error('unique message');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error(theError);

        expect(unhandler).toHaveBeenCalledWith(
          expect.objectContaining({ reason: theError }),
        );
      });
      window.removeEventListener('unhandledrejection', unhandler);
    });
  });
});
