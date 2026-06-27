import { Service } from '@angular/core';
import mixpanel, { Config, Dict } from 'mixpanel-browser';

@Service()
export class MixpanelBackendService {
  init(token: string, config: Partial<Config>): void {
    mixpanel.init(token, config);
  }

  config(config: Partial<Config>): void {
    mixpanel.set_config(config);
  }

  track(eventName: string, properties?: Dict): void {
    mixpanel.track(eventName, properties);
  }
}
