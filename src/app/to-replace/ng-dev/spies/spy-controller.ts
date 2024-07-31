import { isEqual, isUndefined, remove } from '@s-libs/micro-dash';
import { buildErrorMessage } from './utils';

export type CallMatcher<F extends jasmine.Func> =
  | Parameters<F>
  | ((callInfo: jasmine.CallInfo<F>) => boolean);

export class SpyController<F extends jasmine.Func> {
  #calls: Array<jasmine.CallInfo<F>> = [];
  #syncedCount = 0;

  constructor(private spy: jasmine.Spy<F>) {}

  expectOne(
    matcher: CallMatcher<F>,
    description?: string,
  ): jasmine.CallInfo<F> {
    const matches = this.match(matcher);
    if (matches.length !== 1) {
      throw new Error(
        buildErrorMessage({
          matchType: 'one matching',
          itemType: 'call',
          matches,
          stringifiedUserInput: this.#stringifyUserInput(matcher, description),
        }),
      );
    }
    return matches[0];
  }

  expectNone(matcher: CallMatcher<F>, description?: string): void {
    const matches = this.match(matcher);
    if (matches.length > 0) {
      throw new Error(
        buildErrorMessage({
          matchType: 'zero matching',
          itemType: 'call',
          stringifiedUserInput: this.#stringifyUserInput(matcher, description),
          matches,
        }),
      );
    }
  }

  match(matcher: CallMatcher<F>): Array<jasmine.CallInfo<F>> {
    this.#syncCalls();
    let filterFn: (callInfo: jasmine.CallInfo<F>) => boolean;
    if (Array.isArray(matcher)) {
      filterFn = this.#makeArgumentMatcher(matcher);
    } else {
      filterFn = matcher;
    }
    return remove(this.#calls, filterFn);
  }

  verify(): void {
    if (this.#calls.length) {
      this.#syncCalls();
      let message =
        buildErrorMessage({
          matchType: 'no open',
          itemType: 'call',
          stringifiedUserInput: undefined,
          matches: this.#calls,
        }) + ':';
      for (const call of this.#calls) {
        message += `\n  ${stringifyArgs(call.args)}`;
      }
      throw new Error(message);
    }
  }

  #syncCalls(): void {
    const all = this.spy.calls.all();
    this.#calls.push(...all.slice(this.#syncedCount));
    this.#syncedCount = all.length;
  }

  #makeArgumentMatcher(
    args: Parameters<F>,
  ): (callInfo: jasmine.CallInfo<F>) => boolean {
    return (callInfo) => isEqual(callInfo.args, args);
  }

  #stringifyUserInput(matcher: CallMatcher<F>, description?: string): string {
    if (isUndefined(description)) {
      if (Array.isArray(matcher)) {
        description = 'Match by arguments: ' + stringifyArgs(matcher);
      } else {
        description = 'Match by function: ' + matcher.name;
      }
    }
    return description;
  }
}

function stringifyArgs(args: any[]): string {
  return JSON.stringify(args);
}
