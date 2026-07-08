import { NotifiableError } from '@bugsnag/js';
import { BugsnagBackend } from 'app/to-replace/bugsnag/bugsnag.service';
import { ServiceHarnessSuperclass } from 'app/to-replace/ng-dev/service-harness-superclass';
import { MockAsyncBackendKit } from 'app/to-replace/ng-vitest/mock-async-backend-kit';

const mockBackendKit = new MockAsyncBackendKit(BugsnagBackend);
export const bugSnagTestProviders = mockBackendKit.providers;

export class BugSnagServiceHarness extends ServiceHarnessSuperclass {
  #backend = this.getCtx().inject(mockBackendKit.token);

  async expectNotify(error: NotifiableError): Promise<void> {
    await this.getCtx().tick();
    this.#backend.notify.controller.expectOne([error]);
  }
}
