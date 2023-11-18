import { ensureSpiedOn } from 'app/to-replace/ng-dev/ensure-spied-on';

/**
 *
 */
export function spyOnlyWithArgs<T extends object, K extends keyof T>(
  object: T,
  method: T[K] extends Function ? K : never,
  args: jasmine.MatchableArgs<T[K]>,
): jasmine.SpyAnd<
  T[K] extends jasmine.Func
    ? T[K]
    : T[K] extends { new (...args: infer A): infer V }
      ? (...args: A) => V
      : never
> {
  return ensureSpiedOn(object, method)
    .and.callThrough()
    .withArgs(...(args as any)).and;
}
