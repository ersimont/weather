import { NotifiableError } from '@bugsnag/js';
import { TestCall } from '@s-libs/ng-vitest';
import { BugsnagBackend } from 'app/to-replace/bugsnag/bugsnag-backend';
import { BugsnagConfig } from 'app/to-replace/bugsnag/bugsnag-config';
import { MockAsyncBackendKit } from 'app/to-replace/ng-vitest/mock-async-backend-kit';
import { ServiceHarnessSuperclass } from 'app/to-replace/ng-vitest/service-harness-superclass';

const mockBackendKit = new MockAsyncBackendKit(BugsnagBackend);
export const bugSnagTestProviders = mockBackendKit.providers;

export class BugsnagServiceHarness extends ServiceHarnessSuperclass {
  #backend = this.getCtx().inject(mockBackendKit.token);

  async expectStart(config: BugsnagConfig): Promise<void> {
    await this.getCtx().tick();
    this.#backend.start.controller.expectOne([config]);
  }

  async expectNotify(error: NotifiableError): Promise<void> {
    await this.getCtx().tick();
    this.#backend.notify.controller.expectOne([error]);
  }

  async getNotifyCalls(): Promise<Array<TestCall<BugsnagBackend['notify']>>> {
    await this.getCtx().tick();
    return this.#backend.notify.controller.match(() => true);
  }
}
