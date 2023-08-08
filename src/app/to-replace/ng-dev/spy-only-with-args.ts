import { ensureSpiedOn } from 'app/to-replace/ng-dev/ensure-spied-on';
import { FunctionKeys } from 'utility-types';

/**
 *
 */
export function spyOnlyWithArgs<T extends object, K extends FunctionKeys<T>>(
  object: T,
  method: K,
  args: jasmine.MatchableArgs<T[K]>,
): jasmine.SpyAnd<T[K]> {
  return ensureSpiedOn(object, method)
    .and.callThrough()
    .withArgs(...args).and;
}
