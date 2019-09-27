import { Directive, ElementRef, Injector, Input } from "@angular/core";
import { fromEvent } from "rxjs";
import { switchMap } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";

@Directive({ selector: "[sTrack]" })
export class STrackDirective extends DirectiveSuperclass {
  @Input("sTrack") event!: string;
  @Input() eventName!: string;
  @Input() eventCategory!: string;
  @Input() eventParams?: Record<string, any>;

  constructor(elementRef: ElementRef, injector: Injector) {
    super(injector);
    this.subscribeTo(
      this.getInput$("event").pipe(
        switchMap((event) => fromEvent(elementRef.nativeElement, event)),
      ),
      () => {
        trackEvent(this.eventName, this.eventCategory, this.eventParams);
      },
    );
  }
}

export function trackEvent(
  name: string,
  category: string,
  params: Record<string, any> = {},
) {
  gtag("event", name, { event_category: category, ...params });
}
