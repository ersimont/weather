import { inject, Injectable } from '@angular/core';
import { mapKeys, snakeCase } from '@s-libs/micro-dash';
import { EventTrackingConfig } from './event-tracking-config';
import { MixpanelBackendService } from './mixpanel-backend.service';

/* eslint-disable camelcase */

@Injectable({ providedIn: 'root' })
export class EventTrackingService {
  #backend?: MixpanelBackendService;
  #config = inject(EventTrackingConfig);

  constructor() {
    if (this.#config.mixpanelToken) {
      this.#backend = inject(MixpanelBackendService);
      this.#backend.init(this.#config.mixpanelToken, {
        ignore_dnt: true,
        disable_persistence: true,
      });
    }
    this.track('open_app');
    this.#backend?.config({
      // https://docs.mixpanel.com/docs/data-structure/property-reference
      // Find everything with a checkmark for "Javascript" and remove any that
      // could factor into identifying a user.
      property_blacklist: [
        '$device',
        '$referrer',
        '$referring_domain',
        '$screen_height',
        '$screen_width',
        '$search_engine',
        'mp_lib',
      ],
    });
  }

  track(eventName: string, params?: Record<string, any>): void {
    params = mapKeys(params, (_, key) => snakeCase(key));
    this.#backend?.track(eventName, params);
    if (this.#config.log) {
      console.log('[tracking event]', eventName, params);
    }
  }
}
