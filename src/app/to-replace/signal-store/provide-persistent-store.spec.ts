import { AngularContext } from '@s-libs/ng-vitest';
import { RootStore } from '@s-libs/signal-store';
import { AsyncPersistence } from 'app/to-replace/js-core/persistence/async-persistence';
import { providePersistentStore } from 'app/to-replace/signal-store/provide-persistent-store';

describe('providePersistentStore()', () => {
  class EmptyState {
    constructor(public _version = 1) {}
  }

  class EmptyStore extends RootStore<EmptyState> {}

  it('provides a persisted store', async () => {
    const persistence = new AsyncPersistence('theKey');
    await persistence.clear();

    const providers = providePersistentStore({
      dbName: 'theKey',
      type: EmptyStore,
      buildDefaultState: () => new EmptyState(),
    });

    const ctx = new AngularContext({ providers });
    await ctx.run(async () => {
      const store = ctx.inject(EmptyStore);
      store.state = new EmptyState(2);
      await ctx.tick();
      expect(await persistence.get()).toEqual({ _version: 2 });
    });
  });
});
