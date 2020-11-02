import { wrapFunction } from '@s-libs/js-core';

export function logTimeouts() {
  window.setTimeout = wrapFunction(window.setTimeout, {
    before(...args: any[]) {
      console.log('setTimeout(', ...args, ')');
    },
  }) as any;
}
