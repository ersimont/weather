import { Type } from '@angular/core';
import { functions } from 'app/to-replace/functions';

// adapted from https://github.com/ngneat/spectator/blob/e13c9554778bdb179dfc7235aedb4b3b90302850/projects/spectator/src/lib/mock.ts
export function createSpyOfType<T>(type: Type<T>): jasmine.SpyObj<T> {
  const mock: any = {};
  for (
    let proto = type.prototype;
    proto && proto !== Object.prototype;
    proto = proto.prototype
  ) {
    for (const key of functions(proto)) {
      mock[key] = jasmine.createSpy(key);
    }
  }
  return mock;
}
