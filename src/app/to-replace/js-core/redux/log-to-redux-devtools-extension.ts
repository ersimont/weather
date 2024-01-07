import { effect } from '@angular/core';
import { EnhancerOptions } from './enhancer-options';

export interface Connection {
  send: (action: any, state: any) => void;
}

export interface Extension {
  connect: (options?: EnhancerOptions) => Connection;
}

export function logToReduxDevtoolsExtension(
  valueFn: () => any,
  options?: EnhancerOptions,
): void {
  const extension: Extension | undefined = (window as any)
    .__REDUX_DEVTOOLS_EXTENSION__;
  if (!extension) {
    return;
  }

  const connection = extension.connect(options);
  effect(() => {
    connection.send({}, valueFn());
  });
}
