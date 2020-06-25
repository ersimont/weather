/**
 * Get and put objects from/to local storage. They will be (de)serialized as JSON, so be sure that's OK for your objects. They can optionally pass through a `MigrationManager` to handle backward compatibility after app updates.
 *
 * ```ts
 * // if 'my key' has never been used before
 * const persistence = new Persistence('my key');
 * persistence.get(); // undefined
 * persistence.get({ defaultValue: { name: 'John Doe' }); // { name: 'John Doe' }
 *
 * // now you set it
 * persistence.put({ _version: 1, name: 'Robert Downing' });
 *
 * // these will work even after the app reloads (e.g. the next week)
 * persistence.get(); // { _version: 1, name: 'Robert Downing' }
 * persistence.get({ defaultValue: { name: 'John Doe' }}); // { _version: 1, name: 'Robert Downing' }
 *
 * // in a future version of your app, you update the data structure to use "fullName" instead of "name"
 * declare const migrationManager: MigrationManager; // set this up according to its docs
 * persistence.get({
 *   defaultValue: { _version: 2, fullName: 'John Doe' },
 *   migrationManager,
 * }); // { _version: 2, fullName: 'Robert Downing' }
 * ```
 */
export class Persistence<T> {
  /**
   * @param key The key in local storage at which to find the existing object (if any), and to save it.
   */
  constructor(private key: string) {}

  /**
   * Serializes `obj` and saves it in local storage.
   */
  put(obj: T) {
    localStorage.setItem(this.key, JSON.stringify(obj));
  }

  /**
   * Retrieves a deserialized copy of the saved object.
   *
   * @param defaultValue returned when local storage does not contain anything at `this.key`. If you supply `migrationManager`, it is also passed to it as `reference`.
   * @param migrationManager if supplied will be run with the object to perform any updates needed to an old version saved in local storage.
   */
  get() {
    const savedStr = localStorage.getItem(this.key);
    return savedStr === null ? undefined : JSON.parse(savedStr);
  }

  /**
   * Deletes the saved item from local storage.
   */
  clear() {
    localStorage.removeItem(this.key);
  }
}
