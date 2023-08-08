import { FunctionKeys } from 'utility-types';

export function ensureSpiedOn<T extends object, K extends FunctionKeys<T>>(
  object: T,
  method: K,
): jasmine.Spy<T[K]> {
  if ('and' in object[method]) {
    return object[method];
  } else {
    return spyOn(object, method as any);
  }
}
