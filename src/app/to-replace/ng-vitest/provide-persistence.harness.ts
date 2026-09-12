import { InjectionToken, Provider } from '@angular/core';
import { Deferred, PublicInterface } from '@s-libs/js-core';
import { memoize } from '@s-libs/micro-dash';
import { AngularContext } from '@s-libs/ng-vitest';
import type { AsyncPersistence } from '../js-core/persistence/async-persistence';
import type { VersionedObject } from '../js-core/persistence/migrations';
import { BACKEND_FACTORY } from '../ng-core/provide-persistence';
import { ServiceHarnessSuperclass } from './service-harness-superclass';

export const MOCK_BACKEND_FACTORY = new InjectionToken<
  (dbName: string) => MockPersistenceBackend<any>
>('mock backend factory');

export function provideMockPersistence(
  getInitialState: (dbName: string) => any,
): Provider[] {
  return [
    {
      provide: MOCK_BACKEND_FACTORY,
      useFactory: () =>
        memoize(
          (dbName: string) =>
            new MockPersistenceBackend(getInitialState(dbName)),
        ),
    },
    { provide: BACKEND_FACTORY, useExisting: MOCK_BACKEND_FACTORY },
  ];
}

export class MockPersistenceBackend<T extends VersionedObject>
  extends ServiceHarnessSuperclass
  implements PublicInterface<AsyncPersistence<T>>
{
  #isPaused = false;
  #pause = new Deferred<void>();

  constructor(public value: T | undefined) {
    super();
    this.#pause.resolve();
  }

  static get(dbName: string): MockPersistenceBackend<any> {
    return AngularContext.getCurrent()!.inject(MOCK_BACKEND_FACTORY)(dbName);
  }

  pause(): void {
    if (!this.#isPaused) {
      this.#pause = new Deferred<void>();
      this.#isPaused = true;
    }
  }

  async resume(): Promise<void> {
    this.#pause.resolve();
    this.#isPaused = false;
    await this.getCtx().tick();
  }

  async put(obj: T): Promise<void> {
    await this.#pause.promise;
    this.value = obj;
  }

  async get(): Promise<T | undefined> {
    await this.#pause.promise;
    return this.value;
  }

  async clear(): Promise<void> {
    await this.#pause.promise;
    this.value = undefined;
  }
}
