import { LazyBackendSuperclass } from 'app/to-replace/ng-dev/lazy/lazy-backend-superclass';
import { Config, Dict, Mixpanel } from 'mixpanel-browser';

export class MixpanelBackend extends LazyBackendSuperclass<Mixpanel> {
  static token = LazyBackendSuperclass.createToken(MixpanelBackend, async () =>
    import('mixpanel-browser').then((m) => m.default),
  );

  init(token: string, config: Partial<Config>): void {
    this.impl.init(token, config);
  }

  track(eventName: string, properties?: Dict): void {
    this.impl.track(eventName, properties);
  }
}
