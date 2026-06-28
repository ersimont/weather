import { isEqual } from '@s-libs/micro-dash';
import { TestCall } from '@s-libs/ng-vitest';
import { Dict } from 'mixpanel-browser';
import { ServiceHarnessSuperclass } from '../ng-dev/service-harness-superclass';
import { MockBackendKit } from '../ng-dev/spies/build-mock-backend-kit';
import { MixpanelBackendService } from './mixpanel-backend.service';

type TrackFn = MixpanelBackendService['track'];
type Params = Dict | undefined;

const mockBackendKit = new MockBackendKit(MixpanelBackendService);
export const eventTrackingTestProviders = mockBackendKit.providers;

export class EventTrackingServiceHarness extends ServiceHarnessSuperclass {
  #backend = this.getCtx().inject(mockBackendKit.token);

  expectOne(name: string, params: Params = {}): void {
    this.#backend.track.controller.expectOne(
      (call) => call.getArgs()[0] === name && isEqual(getParams(call), params),
    );
  }

  expectNone(name: string): void {
    this.#backend.track.controller.expectNone(matchName(name));
  }

  getEvents(name: string): Params[] {
    return this.#backend.track.controller.match(matchName(name)).map(getParams);
  }
}

function matchName(name: string): (call: TestCall<TrackFn>) => boolean {
  return (call) => call.getArgs()[0] === name;
}

function getParams(call: TestCall<TrackFn>): Params {
  return call.getArgs()[1];
}
