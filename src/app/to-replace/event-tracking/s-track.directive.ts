import { Directive, ElementRef, Injector, Input } from "@angular/core";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { fromEvent } from "rxjs";
import { switchMap } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";

@Directive({ selector: "[sTrack]" })
export class STrackDirective extends DirectiveSuperclass {
  @Input("sTrack") event!: string;
  @Input() eventName!: string;
  @Input() eventCategory!: string;
  @Input() eventParams?: Record<string, any>;

  constructor(
    elementRef: ElementRef,
    eventTrackingService: EventTrackingService,
    injector: Injector,
  ) {
    super(injector);
    this.subscribeTo(
      this.getInput$("event").pipe(
        switchMap((event) => fromEvent(elementRef.nativeElement, event)),
      ),
      () => {
        eventTrackingService.track(
          this.eventName,
          this.eventCategory,
          this.eventParams,
        );
      },
    );
  }
}
