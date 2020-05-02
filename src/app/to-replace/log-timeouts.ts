import { wrapFunction } from "s-js-utils";

export function logTimeouts() {
  window.setTimeout = wrapFunction(window.setTimeout, {
    before(...args: any[]) {
      console.log("setTimeout(", ...args, ")");
    },
  }) as any;
}
