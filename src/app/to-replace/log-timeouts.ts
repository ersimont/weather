import { wrapFunction } from '@s-libs/js-core';

export function logTimeouts(): void {
  window.setTimeout = wrapFunction(window.setTimeout, {
    before(...args: any[]): void {
      console.log('setTimeout(', ...args, ')');
    },
  }) as any;
}
