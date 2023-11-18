import { BrowserConfig, NotifiableError, OnErrorCallback } from '@bugsnag/js';
import { property } from '@s-libs/micro-dash';

export type BugsnagConfig = BrowserConfig;

const bugsnagPromise = import('@bugsnag/js').then(property('default'));

export const LazyBugsnag = {
  start(config: BugsnagConfig): void {
    bugsnagPromise.then((Bugsnag) => {
      Bugsnag.start(config);
    });
  },

  notify(error: NotifiableError): void {
    bugsnagPromise.then((Bugsnag) => {
      Bugsnag.notify(error);
    });
  },

  addOnError(fn: OnErrorCallback): void {
    bugsnagPromise.then((Bugsnag) => {
      Bugsnag.addOnError(fn);
    });
  },

  leaveBreadcrumb(action: string): void {
    bugsnagPromise.then((Bugsnag) => {
      Bugsnag.leaveBreadcrumb(action);
    });
  },

  isStarted(): Promise<boolean> {
    return bugsnagPromise.then((Bugsnag) => {
      return Bugsnag.isStarted();
    });
  },
};
