import { inject, Injectable } from '@angular/core';
import { BrowserConfig, BugsnagStatic, NotifiableError } from '@bugsnag/js';
import { CONFIG } from 'app/to-replace/bugsnag/bugsnag-config';
import { AsyncBackend } from 'app/to-replace/ng-dev/async-backend';

@Injectable()
export class BugsnagService {
  #backendPromise = inject(BugsnagBackend.token);

  constructor() {
    this.#trigger('start', {
      collectUserIp: false,
      generateAnonymousId: false,
      ...inject(CONFIG),
    });
  }

  notify(error: NotifiableError): void {
    this.#trigger('notify', error);
  }

  #trigger<M extends BackendMethod>(
    method: M,
    ...args: Parameters<BugsnagBackend[M]>
  ): void {
    this.#backendPromise.then(
      (backend) => {
        (backend[method] as Func)(...args);
      },
      (err: unknown) => {
        console.error(`Error triggering Bugsnag.${method}`, err);
      },
    );
  }
}

export class BugsnagBackend extends AsyncBackend<BugsnagStatic> {
  static token = AsyncBackend.createToken(BugsnagBackend, async () =>
    import('@bugsnag/js').then((m) => m.default),
  );

  start(config: BrowserConfig): void {
    this.impl.start(config);
  }

  notify(error: NotifiableError): void {
    this.impl.notify(error);
  }
}

type Func = (...args: any[]) => any;
type BackendMethod = keyof {
  [K in keyof BugsnagBackend as BugsnagBackend[K] extends Func ? K : never]: 1;
};
