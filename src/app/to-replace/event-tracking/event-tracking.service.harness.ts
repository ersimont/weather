import { matches } from "micro-dash";

export class EventTrackingServiceHarness {
  getErrorDescriptions() {
    return ga.q
      .filter(matches(["send", { hitType: "exception" }]))
      .map((event) => event[1].exDescription);
  }
}
