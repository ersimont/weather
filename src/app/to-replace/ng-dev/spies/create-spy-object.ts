import { Type } from '@angular/core';
import { functions } from '@s-libs/micro-dash';
import { SpyController } from './spy-controller';

// adapted from https://github.com/ngneat/spectator/blob/e13c9554778bdb179dfc7235aedb4b3b90302850/projects/spectator/src/lib/mock.ts

export type SpyObject<T> = {
  [K in keyof T]: T[K] extends jasmine.Func
    ? jasmine.Spy<T[K]> & { controller: SpyController<T[K]> }
    : never;
};

/**
 * Creates a new object with jasmine spies for each method in `type`.
 *
 * ```ts
 * class Greeter {
 *   greet(name: string) {
 *     return `Hello, ${name}!`;
 *   }
 * }
 *
 * const spyObject = createSpyObject(Greeter);
 * spyObject.greet.and.returnValue("Hello, stub!");
 * expect(spyObject.greet("Eric")).toBe("Hello, stub!");
 * expectSingleCallAndReset(spyObject.greet, "Eric");
 * ```
 */
export function createSpyObject<T>(type: Type<T>): SpyObject<T> {
  const mock: any = {};
  for (
    let proto = type.prototype;
    proto !== null;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const key of functions(proto)) {
      mock[key] = jasmine.createSpy(key);
      mock[key].controller = new SpyController(mock[key]);
    }
  }
  return mock;
}
