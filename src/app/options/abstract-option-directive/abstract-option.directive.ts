import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { InjectableSuperclass } from '@s-libs/ng-core';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/mixpanel-core/event-tracking.service';
import { fromEvent } from 'rxjs';

@Directive()
export abstract class AbstractOptionDirective extends InjectableSuperclass {
  protected readonly store = inject(WeatherStore);

  private readonly header = viewChild.required(MatExpansionPanelHeader);
  private readonly headerEl = viewChild.required(MatExpansionPanelHeader, {
    read: ElementRef,
  });
  readonly #eventTrackingService = inject(EventTrackingService);

  protected abstract optionType: string;

  constructor() {
    super();
    afterNextRender(() => {
      this.subscribeTo(
        fromEvent(this.headerEl().nativeElement, 'click'),
        () => {
          this.#trackToggle();
        },
      );
    });
  }

  protected trackChange(id: string): void {
    this.#eventTrackingService.track(`change_${id}`, {
      category: `change_${this.optionType}`,
    });
  }

  #trackToggle(): void {
    const action = this.header()._isExpanded() ? 'open' : 'close';
    this.#eventTrackingService.track(`${action}_${this.optionType}_options`, {
      category: 'navigate',
    });
  }
}
