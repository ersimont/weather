import { effect, EffectRef, Signal } from '@angular/core';

export function debounceWhileHandling<T>(
  input: Signal<T>,
  handle: (value: T) => Promise<void>,
): EffectRef {
  let nextValue: T;
  let inFlight = false;
  let queued = false;
  return effect(() => {
    nextValue = input();
    if (inFlight) {
      queued = true;
    } else {
      doIt();
    }
  });

  function doIt(): void {
    inFlight = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- because this is library code, we'll leave it to the user to collect this error (probably with `provideBrowserGlobalErrorListeners`)
    handle(nextValue).finally(() => {
      inFlight = false;
      if (queued) {
        queued = false;
        doIt();
      }
    });
  }
}
