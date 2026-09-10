import { isEqual } from '@s-libs/micro-dash';
import { TestCall } from '@s-libs/ng-vitest';
import { MockBackendKit } from 'app/to-replace/ng-vitest/mock-backend-kit';
import { Dict } from 'mixpanel-browser';
import { ServiceHarnessSuperclass } from '../ng-vitest/service-harness-superclass';
import { MixpanelBackend } from './mixpanel-backend';

type TrackFn = MixpanelBackend['track'];

const mockBackendKit = new MockBackendKit(MixpanelBackend);
export const mixpanelTestProviders = mockBackendKit.providers;

export class MixpanelServiceHarness extends ServiceHarnessSuperclass {
  #backend = this.getCtx().inject(mockBackendKit.token);

  async expectOne(name: string, params?: Dict): Promise<void> {
    await this.getCtx().tick();
    this.#backend.track.controller.expectOne((call) =>
      isEqual(call.getArgs(), [name, params]),
    );
  }

  async expectNone(name: string): Promise<void> {
    await this.getCtx().tick();
    this.#backend.track.controller.expectNone(matchName(name));
  }
}

function matchName(name: string): (call: TestCall<TrackFn>) => boolean {
  return (call) => getName(call) === name;
}

function getName(call: TestCall<TrackFn>): string {
  return call.getArgs()[0];
}
