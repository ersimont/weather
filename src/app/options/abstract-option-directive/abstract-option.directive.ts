import { Directive, ElementRef, inject, ViewChild } from '@angular/core';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { fromEvent } from 'rxjs';

@Directive()
export abstract class AbstractOptionDirective extends DirectiveSuperclass {
  protected store = inject(WeatherStore);
  protected abstract optionType: string;

  #eventTrackingService = inject(EventTrackingService);

  @ViewChild(MatExpansionPanelHeader)
  private header!: MatExpansionPanelHeader;

  @ViewChild(MatExpansionPanelHeader, { read: ElementRef })
  set headerElement(ref: ElementRef) {
    this.subscribeTo(fromEvent(ref.nativeElement, 'click'), () => {
      const action = this.header._isExpanded() ? 'open' : 'close';
      this.#eventTrackingService.track(
        `${action}_${this.optionType}_options`,
        'navigate',
      );
    });
  }

  trackChange(id: string): void {
    this.#eventTrackingService.track(
      `change_${id}`,
      `change_${this.optionType}`,
    );
  }
}
