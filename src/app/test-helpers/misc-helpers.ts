import { wrapFunction } from "s-js-utils";

export function logTimeouts() {
  window.setTimeout = wrapFunction(window.setTimeout, {
    before() {
      console.log("setTimeout(", arguments, ")");
    },
  }) as any;
}
