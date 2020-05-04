import { matches } from "micro-dash";

export class EventTrackingServiceHarness {
  getErrorDescriptions() {
    return ga.q
      .filter(matches(["send", { hitType: "exception" }]))
      .map((event) => event[1].exDescription);
  }

  validateEvents(catalog: Record<string, string[]>) {
    for (const { eventCategory, eventAction } of getEvents()) {
      if (!catalog[eventCategory]) {
        throw new Error(`${eventCategory} is not a valid event category`);
      }
      if (!catalog[eventCategory].includes(eventAction)) {
        throw new Error(
          `${eventAction} is not a valid event within ${eventCategory}`,
        );
      }
    }
  }

  getEventCount(name: string) {
    return getEvents().filter(matches({ eventAction: name })).length;
  }
}

function getEvents() {
  return ga.q
    .filter(matches(["send", { hitType: "event" }]))
    .map((command) => command[1]);
}
