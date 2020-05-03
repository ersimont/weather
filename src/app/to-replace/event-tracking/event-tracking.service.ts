import { Injectable } from "@angular/core";
import { EventTrackingConfig } from "app/to-replace/event-tracking/event-tracking-config";
import { initializeGtag } from "app/to-replace/event-tracking/gtag";

@Injectable({ providedIn: "root" })
export class EventTrackingService {
  constructor(config: EventTrackingConfig) {
    initializeGtag(config);
  }

  track(name: string, category: string) {
    this.send(name, { event_category: category });
  }

  sendError(message: string) {
    this.send("exception", { description: message });
  }

  private send(eventName: string, params: Record<string, any>) {
    gtag("event", eventName, { ...params });
  }
}
