import { matches } from "micro-dash";

export class EventTrackingServiceHarness {
  getErrorDescriptions() {
    return ga.q
      .filter(matches(["send", { hitType: "exception" }]))
      .map((event) => event[1].exDescription);
  }

  validateEvents(catalog: Record<string, string[]>) {
    for (const event of getEvents()) {
      const category = event[1].eventCategory;
      const action = event[1].eventAction;
      if (!catalog[category]) {
        throw new Error(`${category} is not a valid event category`);
      }
      if (!catalog[category].includes(action)) {
        throw new Error(`${action} is not a valid event within ${category}`);
      }
    }
  }
}

function getEvents() {
  return ga.q.filter(matches(["send", { hitType: "event" }]));
}
