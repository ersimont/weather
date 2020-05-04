import { matches } from "micro-dash";

export class EventTrackingServiceHarness {
  getErrorDescriptions() {
    return ga.q
      .filter(matches(["send", "exception"]))
      .map((event) => event[2].exDescription);
  }
}
