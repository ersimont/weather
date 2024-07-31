import { isEqual } from '@s-libs/micro-dash';
import { Dict } from 'mixpanel-browser';
import { ServiceHarnessSuperclass } from '../ng-dev/service-harness-superclass';
import { MockBackendKit } from '../ng-dev/spies/build-mock-backend-kit';
import { CallMatcher } from '../ng-dev/spies/spy-controller';
import { MixpanelBackendService } from './mixpanel-backend.service';

type TrackFn = MixpanelBackendService['track'];
type Params = Dict | undefined;

const mockBackendKit = new MockBackendKit(MixpanelBackendService);
export const eventTrackingTestProviders = mockBackendKit.providers;

export class EventTrackingServiceHarness extends ServiceHarnessSuperclass {
  #backend = this.getCtx().inject(mockBackendKit.token);

  expectOne(name: string, params: Params = {}): void {
    expect().nothing();
    getParams(
      this.#backend.track.controller.expectOne(
        (call) => call.args[0] === name && isEqual(getParams(call), params),
      ),
    );
  }

  expectNone(name: string): void {
    expect().nothing();
    this.#backend.track.controller.expectNone(matchName(name));
  }

  getEvents(name: string): Params[] {
    return this.#backend.track.controller.match(matchName(name)).map(getParams);
  }
}

function matchName(name: string): CallMatcher<TrackFn> {
  return ({ args }) => args[0] === name;
}

function getParams(call: jasmine.CallInfo<TrackFn>): Params {
  return call.args[1];
}
