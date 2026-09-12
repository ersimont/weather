import { createMockObject, MockObject } from '@s-libs/ng-vitest';
import { AsyncPersistence } from '../js-core/persistence/async-persistence';
import { VersionedObject } from '../js-core/persistence/migrations';

export function mockAsyncPersistence<T extends VersionedObject>(): MockObject<
  AsyncPersistence<T>
> {
  let value: T | undefined;
  const mock = createMockObject(AsyncPersistence<T>);
  mock.put.mockImplementation(async (obj: T) => {
    value = obj;
  });
  mock.get.mockImplementation(async () => value);
  return mock;
}
