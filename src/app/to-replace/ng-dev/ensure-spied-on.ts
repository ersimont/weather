// copied most of the typing from jasmine.SpyOn
export function ensureSpiedOn<T extends object, K extends keyof T>(
  object: T,
  method: T[K] extends Function ? K : never,
): jasmine.Spy<
  T[K] extends jasmine.Func
    ? T[K]
    : T[K] extends { new (...args: infer A): infer V }
      ? (...args: A) => V
      : never
> {
  const obj: any = object;
  if ('and' in obj[method]) {
    return obj[method];
  } else {
    return spyOn(object, method as any);
  }
}
