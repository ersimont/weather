import { tick } from '@angular/core/testing';
import { isObject } from 'app/to-replace/is-object';
import { get } from '@s-libs/micro-dash';
import { isPromiseLike } from 'app/to-replace/is-promise-like';

export type Synchronized<O extends object> = {
  [K in keyof O]: O[K] extends (...args: any[]) => any
    ? SynchronizedFunction<O[K]>
    : O[K];
};
type SynchronizedFunction<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => SynchronizedResult<ReturnType<F>>;
type SynchronizedResult<V> = V extends PromiseLike<any>
  ? SynchronizedPromise<V>
  : V extends object
  ? Synchronized<V>
  : V;
type SynchronizedPromise<P> = P extends PromiseLike<infer R>
  ? R extends object
    ? Synchronized<R>
    : R
  : 'assertion error';

const proxyTarget = Symbol('proxy target'); // trick from https://stackoverflow.com/a/53431924/1836506
export function synchronize<T extends object>(obj: T): Synchronized<T> {
  return new Proxy(obj, {
    get(target, p, receiver): any {
      if (p === proxyTarget) {
        return obj;
      } else {
        return synchronizeAny(Reflect.get(target, p, receiver));
      }
    },
    apply(target, thisArg, argArray): any {
      thisArg = get(thisArg, [proxyTarget], thisArg);
      return synchronizeAny(
        Reflect.apply(target as Function, thisArg, argArray),
      );
    },
  }) as Synchronized<T>;
}

function synchronizeAny(value: any): any {
  if (isPromiseLike(value)) {
    return synchronizePromise(value);
  } else if (isObject(value)) {
    return synchronize(value);
  } else {
    return value;
  }
}

function synchronizePromise<T extends PromiseLike<any>>(promise: T): any {
  let awaited: any;
  promise.then((value) => (awaited = value));
  tick();
  // TODO: a nice error if the promise didn't resolve
  return synchronizeAny(awaited);
}
