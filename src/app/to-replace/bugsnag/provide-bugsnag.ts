import { ErrorHandler, Provider } from '@angular/core';
import { BugsnagConfig, LazyBugsnag } from './lazy-bugsnag';

export function provideBugsnag(config: BugsnagConfig): Provider {
  LazyBugsnag.start({
    collectUserIp: false,
    generateAnonymousId: false,
    ...config,
  });
  return {
    provide: ErrorHandler,
    useValue: {
      handleError: (error: any): void => {
        console.error(error);
        LazyBugsnag.notify(error);
      },
    },
  };
}
