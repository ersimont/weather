import { ModuleWithProviders, NgModule } from "@angular/core";
import { EventTrackingConfig } from "app/to-replace/event-tracking/event-tracking-config";
import { STrackDirective } from "app/to-replace/event-tracking/s-track.directive";

@NgModule({ declarations: [STrackDirective], exports: [STrackDirective] })
export class EventTrackingModule {
  static forRoot(
    gaProperty?: string,
  ): ModuleWithProviders<EventTrackingModule> {
    return {
      ngModule: EventTrackingModule,
      providers: [{ provide: EventTrackingConfig, useValue: { gaProperty } }],
    };
  }
}
