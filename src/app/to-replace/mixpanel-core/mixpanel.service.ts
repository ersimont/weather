import { inject, Injectable } from '@angular/core';
import { mapKeys, snakeCase } from '@s-libs/micro-dash';
import { EagerBridge } from 'app/to-replace/ng-dev/eager-bridge';
import { MixpanelBackend } from './mixpanel-backend';
import { MixpanelConfig } from './mixpanel-config';

/* eslint-disable camelcase */

@Injectable()
export class MixpanelService {
  #lazy?: EagerBridge<MixpanelBackend>;
  #config = inject(MixpanelConfig);

  constructor() {
    if (this.#config.token) {
      this.#lazy = new EagerBridge(MixpanelBackend.token);
      this.#lazy.fireAndForget('init', this.#config.token, {
        ignore_dnt: true,
        disable_persistence: true,

        // https://docs.mixpanel.com/docs/data-structure/property-reference
        // Find everything with a checkmark for "Javascript" and remove any that
        // could factor into identifying a user.
        property_blacklist: [
          '$browser',
          '$browser_version',
          '$current_url',
          '$device',
          '$device_id',
          '$initial_referrer',
          '$initial_referring_domain',
          '$lib_version',
          '$os',
          '$referrer',
          '$referring_domain',
          '$screen_height',
          '$screen_width',
          '$search_engine',
          'mp_lib',
        ],
      });
    }
    this.track('open_app');
  }

  track(eventName: string, params?: Record<string, any>): void {
    params = mapKeys(params, (_, key) => snakeCase(key));
    this.#lazy?.fireAndForget('track', eventName, params);
    if (this.#config.log) {
      console.log('[tracking event]', eventName, params);
    }
  }
}
