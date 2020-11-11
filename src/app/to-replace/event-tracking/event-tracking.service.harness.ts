import { flatten, matches, values } from '@s-libs/micro-dash';

export interface TrackingEvent {
  name: string;
  category: string;
  interaction: boolean;
}

export class EventTrackingServiceHarness {
  private validNames: Set<string>;

  constructor(private catalog: Record<string, string[]>) {
    this.validNames = new Set(flatten(values(catalog)));
  }

  getEvents(name: string): TrackingEvent[] {
    if (!this.validNames.has(name)) {
      throw new Error(`${name} is not a valid event`);
    }

    return getEvents().filter(matches({ name }));
  }

  getErrors(): string[] {
    return ga.q
      .filter(matches(['send', { hitType: 'exception' }]))
      .map((event) => event[1].exDescription);
  }

  validateEvents(): void {
    for (const { name, category } of getEvents()) {
      if (!this.catalog[category]) {
        throw new Error(`${category} is not a valid event category`);
      }
      if (!this.catalog[category].includes(name)) {
        throw new Error(`${name} is not a valid event within ${category}`);
      }
    }
  }
}

function getEvents(): TrackingEvent[] {
  return ga.q
    .filter(matches(['send', { hitType: 'event' }]))
    .map((command) => ({
      name: command[1].eventAction,
      category: command[1].eventCategory,
      interaction: !command[1].nonInteraction,
    }));
}
