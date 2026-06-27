import { Provider } from '@angular/core';

export class EventTrackingConfig {
  log?: boolean;
  mixpanelToken?: string;
}

export function provideEventTracking(config: EventTrackingConfig): Provider {
  return { provide: EventTrackingConfig, useValue: config };
}
