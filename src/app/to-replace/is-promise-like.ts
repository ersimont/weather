export function isPromiseLike(value: any): value is PromiseLike<any> {
  return value && typeof value.then === 'function';
}
