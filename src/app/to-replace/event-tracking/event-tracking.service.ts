import { Injectable } from '@angular/core';
import { EventTrackingConfig } from 'app/to-replace/event-tracking/event-tracking-config';

// This was previously written to use the newer library "gtag.js" instead of the older "analyticsjs", but there was no official otp-out of cookies in the newer version. People on the internet report being able to configure it with the setting `client_storage: none`, but that was undocumented. It loaded `analytics.js` behind the scenes anyway, so I reverted to that "old" library.
//
// It looks like support for that is coming with the "consent" feature, currently in beta: https://developers.google.com/gtagjs/devguide/consent. At that time it may make sense to use the firebase analytics features instead of this self-created package.

@Injectable({ providedIn: 'root' })
export class EventTrackingService {
  constructor(private config: EventTrackingConfig) {
    this.initQueue();
    if (config.gaProperty) {
      this.loadGoogleScript();
    }
  }

  // TODO: switch to sendEvent, sendPageview, sendSocial, sendTiming
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#parameters_3
  track(name: string, category: string, interaction = true): void {
    this.send({
      hitType: 'event',
      eventAction: name,
      eventCategory: category,
      nonInteraction: !interaction,
    });
  }

  private send(fields: UniversalAnalytics.FieldsObject): void {
    if (this.config.log) {
      console.log('[analytics]', fields);
    }
    ga('send', fields);
  }

  private initQueue(): void {
    (window as any).ga = (...args: any[]) => {
      ga.q.push(args);
    };
    ga.q = [];
    ga.l = +new Date();

    ga('create', this.config.gaProperty, { storage: 'none' });
    ga('set', 'anonymizeIp', true); // must come after `create`
    ga('send', 'pageview');
  }

  private loadGoogleScript(): void {
    (window as any).GoogleAnalyticsObject = 'ga';

    const gaTag = document.createElement('script');
    gaTag.async = true;
    gaTag.src = '//www.google-analytics.com/analytics.js';

    const firstScriptTag = document.querySelector('script');
    firstScriptTag!.parentNode!.insertBefore(gaTag, firstScriptTag);
  }
}
