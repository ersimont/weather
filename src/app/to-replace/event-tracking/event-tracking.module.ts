import { ModuleWithProviders, NgModule } from "@angular/core";
import { initializeGtag } from "app/to-replace/event-tracking/gtag";
import { STrackDirective } from "app/to-replace/event-tracking/s-track.directive";

@NgModule({ declarations: [STrackDirective], exports: [STrackDirective] })
export class EventTrackingModule {
  static forRoot(gaProperty: string): ModuleWithProviders {
    initializeGtag(gaProperty);
    return { ngModule: EventTrackingModule };
  }
}
