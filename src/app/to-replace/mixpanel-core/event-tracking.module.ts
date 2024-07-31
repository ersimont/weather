import { ModuleWithProviders, NgModule } from '@angular/core';
import { EventTrackingConfig } from './event-tracking-config';

@NgModule({})
export class EventTrackingModule {
  static forRoot(
    config: EventTrackingConfig = {},
  ): ModuleWithProviders<EventTrackingModule> {
    return {
      ngModule: EventTrackingModule,
      providers: [{ provide: EventTrackingConfig, useValue: config }],
    };
  }
}
