import { Directive, ElementRef, inject, ViewChild } from '@angular/core';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/mixpanel-core/event-tracking.service';
import { fromEvent } from 'rxjs';

@Directive()
export abstract class AbstractOptionDirective extends DirectiveSuperclass {
  @ViewChild(MatExpansionPanelHeader)
  private header!: MatExpansionPanelHeader;

  protected store = inject(WeatherStore);

  #eventTrackingService = inject(EventTrackingService);

  protected abstract optionType: string;

  @ViewChild(MatExpansionPanelHeader, { read: ElementRef })
  set headerElement(ref: ElementRef) {
    this.subscribeTo(fromEvent(ref.nativeElement, 'click'), () => {
      const action = this.header._isExpanded() ? 'open' : 'close';
      this.#eventTrackingService.track(`${action}_${this.optionType}_options`, {
        category: 'navigate',
      });
    });
  }

  trackChange(id: string): void {
    this.#eventTrackingService.track(`change_${id}`, {
      category: `change_${this.optionType}`,
    });
  }
}
