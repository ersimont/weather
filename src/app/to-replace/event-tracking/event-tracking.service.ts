import { Injectable } from "@angular/core";
import { EventTrackingConfig } from "app/to-replace/event-tracking/event-tracking-config";

// This was previously written to use the newer library "gtag.js" instead of the older "analyticsjs", but there was no official otp-out of cookies in the newer version. People on the internet report being able to configure it with the setting `client_storage: none`, but that was undocumented. It literally loaded `analytics.js` behind the scenes anyway, so I reverted to the old library.

@Injectable({ providedIn: "root" })
export class EventTrackingService {
  constructor(config: EventTrackingConfig) {
    initQueue(config);
    if (config.gaProperty) {
      loadGoogleScript();
    }
  }

  // TODO: switch to sendEvent, sendPageview, sendSocial, sendTiming
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#parameters_3
  track(name: string, category: string) {
    ga("send", "event", { eventAction: name, eventCategory: category });
  }

  sendError(message: string) {
    ga("send", "exception", { exDescription: message });
  }
}

function initQueue(config: EventTrackingConfig) {
  (window as any).ga = (...args: any[]) => {
    if (config.log) {
      console.log("[analytics]", JSON.stringify(args));
    }
    ga.q.push(args);
  };
  ga.q = [];
  ga.l = +new Date();

  ga("set", "anonymizeIp", true);
  ga("create", config.gaProperty, { storage: "none" });
}

function loadGoogleScript() {
  (window as any).GoogleAnalyticsObject = "ga";

  const gaTag = document.createElement("script");
  gaTag.async = true;
  gaTag.src = "//www.google-analytics.com/analytics.js";

  const firstScriptTag = document.querySelector("script");
  firstScriptTag!.parentNode!.insertBefore(gaTag, firstScriptTag);
}
