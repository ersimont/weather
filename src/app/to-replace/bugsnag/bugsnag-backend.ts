import { BrowserConfig, BugsnagStatic, NotifiableError } from '@bugsnag/js';
import { LazyBackendSuperclass } from 'app/to-replace/ng-dev/lazy/lazy-backend-superclass';

export class BugsnagBackend extends LazyBackendSuperclass<BugsnagStatic> {
  static token = LazyBackendSuperclass.createToken(BugsnagBackend, async () =>
    import('@bugsnag/js').then((m) => m.default),
  );

  start(config: BrowserConfig): void {
    this.impl.start(config);
  }

  notify(error: NotifiableError): void {
    this.impl.notify(error);
  }
}
