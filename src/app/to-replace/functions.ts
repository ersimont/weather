import { filter, isFunction, keys } from 'micro-dash';

export function functions<T>(obj: T) {
  return filter(
    keys(obj),
    (key) => key !== 'constructor' && isFunction(obj[key as keyof T]),
  );
}
