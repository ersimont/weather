import { Type } from '@angular/core';
import {
  ComponentFixture,
  flushMicrotasks,
  TestBed,
} from '@angular/core/testing';
import { AngularContext } from 'app/to-replace/test-context/angular-context';

// TODO: try destroying the fixture, or test bed, or platform instead
const initialStyles = new Set(Array.from(document.querySelectorAll('style')));
function trimLeftoverStyles() {
  for (const style of Array.from(document.querySelectorAll('style'))) {
    if (!initialStyles.has(style)) {
      style.remove();
    }
  }
}

export abstract class ComponentContext<
  ComponentType,
  InitOptions
> extends AngularContext<InitOptions> {
  protected abstract componentType: Type<ComponentType>;
  protected fixture!: ComponentFixture<unknown>;

  static setUp() {
    AngularContext.setUp();
    beforeEach(() => {
      trimLeftoverStyles();
    });
  }

  tick(millis?: number) {
    flushMicrotasks();
    this.fixture.detectChanges();
    super.tick(millis);
  }

  protected init(_options: Partial<InitOptions>) {
    this.fixture = TestBed.createComponent(this.componentType);
    this.fixture.detectChanges();
    this.tick();
  }
}
