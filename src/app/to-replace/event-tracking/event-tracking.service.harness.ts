import { matches } from "micro-dash";

export interface TrackingEvent {
  name: string;
  category: string;
  interaction: boolean;
}

export class EventTrackingServiceHarness {
  getEvents(match: Partial<TrackingEvent>) {
    return getEvents().filter(matches(match));
  }

  getErrors() {
    return ga.q
      .filter(matches(["send", { hitType: "exception" }]))
      .map((event) => event[1].exDescription);
  }

  validateEvents(catalog: Record<string, string[]>) {
    for (const { name, category } of getEvents()) {
      if (!catalog[category]) {
        throw new Error(`${category} is not a valid event category`);
      }
      if (!catalog[category].includes(name)) {
        throw new Error(`${name} is not a valid event within ${category}`);
      }
    }
  }
}

function getEvents() {
  return ga.q
    .filter(matches(["send", { hitType: "event" }]))
    .map((command) => ({
      name: command[1].eventAction,
      category: command[1].eventCategory,
      interaction: !command[1].nonInteraction,
    }));
}
