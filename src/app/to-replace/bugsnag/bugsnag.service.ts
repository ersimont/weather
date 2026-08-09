import { inject, Injectable } from '@angular/core';
import { NotifiableError } from '@bugsnag/js';
import { BugsnagBackend } from 'app/to-replace/bugsnag/bugsnag-backend';
import { CONFIG } from 'app/to-replace/bugsnag/bugsnag-config';
import { EagerBridge } from 'app/to-replace/ng-dev/lazy/eager-bridge';

@Injectable()
export class BugsnagService {
  #backend = new EagerBridge(BugsnagBackend.token);

  constructor() {
    this.#backend.fireAndForget('start', {
      collectUserIp: false,
      generateAnonymousId: false,
      ...inject(CONFIG),
    });
  }

  notify(error: NotifiableError): void {
    this.#backend.fireAndForget('notify', error);
  }
}
