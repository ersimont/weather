import { Injectable } from "@angular/core";
import { EventTrackingConfig } from "app/to-replace/event-tracking/event-tracking-config";
import { initializeGtag } from "app/to-replace/event-tracking/gtag";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class EventTrackingService {
  constructor(config: EventTrackingConfig) {
    initializeGtag(config.gaProperty);
  }

  track(name: string, category: string, params: Record<string, any> = {}) {
    gtag("event", name, { event_category: category, ...params });
    if (!environment.production) {
      console.log("[event]", category, name, params);
    }
  }
}
