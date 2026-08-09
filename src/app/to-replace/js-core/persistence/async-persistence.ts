import { Deferred } from '@s-libs/js-core';

const storeName = 's-libs/AsyncPersistence';
const objKey = 'obj';

export class AsyncPersistence<T> {
  #dbDeferred = new Deferred<IDBDatabase>();

  constructor(dbName: string) {
    const openRequest = indexedDB.open(dbName);
    openRequest.onupgradeneeded = (): void => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    openRequest.onsuccess = (): void => {
      this.#dbDeferred.resolve(openRequest.result);
    };
    openRequest.onerror = this.#dbDeferred.reject;
  }

  async put(obj: T): Promise<void> {
    const store = await this.#getStore('readwrite');
    await getCompletion(store.put(obj, objKey));
  }

  async get(): Promise<T | undefined> {
    const store = await this.#getStore();
    return getCompletion<T | undefined>(store.get(objKey));
  }

  async clear(): Promise<void> {
    const store = await this.#getStore('readwrite');
    await getCompletion(store.delete(objKey));
  }

  async #getStore(mode?: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.#dbDeferred.promise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }
}

export async function getCompletion<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = reject;
    request.onsuccess = (): void => {
      resolve(request.result);
    };
  });
}
