import { tick } from '@angular/core/testing';
import { isObject } from 'app/to-replace/is-object';
import { isPromiseLike } from 'app/to-replace/is-promise-like';
import { get } from 'micro-dash';

export type Synchronized<V> = V extends PromiseLike<any>
  ? SynchronizedPromise<V>
  : V extends object
  ? SynchronizedObject<V>
  : V;
type SynchronizedPromise<P> = P extends PromiseLike<infer R>
  ? R extends object
    ? SynchronizedObject<R>
    : R
  : 'assertion error';
type SynchronizedObject<O extends object> = {
  [K in keyof O]: O[K] extends (...args: any[]) => any
    ? SynchronizedFunction<O[K]>
    : Synchronized<O[K]>;
};
type SynchronizedFunction<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => Synchronized<ReturnType<F>>;

export function synchronize<T>(value: T): Synchronized<T> {
  if (isPromiseLike(value)) {
    return synchronizePromise(value);
  } else if (isObject(value)) {
    return synchronizeObject(value);
  } else {
    return value as any;
  }
}

function synchronizePromise<T extends PromiseLike<any>>(promise: T) {
  let awaited: any;
  promise.then((value) => (awaited = value));
  tick();
  // TODO: a nice error if the promise didn't resolve
  return synchronize(awaited);
}

const proxyTarget = Symbol('proxy target'); // trick from https://stackoverflow.com/a/53431924/1836506
function synchronizeObject(obj: any): any {
  return new Proxy(obj, {
    get(target, p, receiver) {
      if (p === proxyTarget) {
        return obj;
      } else {
        return synchronize(Reflect.get(target, p, receiver));
      }
    },
    apply(target, thisArg, argArray) {
      thisArg = get(thisArg, [proxyTarget], thisArg);
      return synchronize(Reflect.apply(target, thisArg, argArray));
    },
  });
}
