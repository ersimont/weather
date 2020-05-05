import { HttpTestingController } from "@angular/common/http/testing";
import { AbstractType, InjectFlags, InjectionToken, Type } from "@angular/core";
import {
  ComponentFixture,
  discardPeriodicTasks,
  flushMicrotasks,
  TestBed,
  tick,
} from "@angular/core/testing";
import { DomContext } from "app/to-replace/test-context/dom-context";

const initialStyles = new Set(Array.from(document.querySelectorAll("style")));

export abstract class AngularContext extends DomContext {
  protected fixture?: ComponentFixture<unknown>;

  constructor() {
    super();
    for (const style of Array.from(document.querySelectorAll("style"))) {
      if (!initialStyles.has(style)) {
        style.remove();
      }
    }
  }

  cleanUp() {
    this.injectIfProvided(HttpTestingController)?.verify();
    discardPeriodicTasks();
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>) {
    return TestBed.inject(token);
  }

  injectIfProvided<T>(
    token: Type<T> | InjectionToken<T> | AbstractType<T>,
  ): T | undefined {
    return TestBed.inject(token, undefined, InjectFlags.Optional);
  }

  tick(millis?: number) {
    if (this.fixture) {
      flushMicrotasks();
      this.fixture.detectChanges();
    }
    tick(millis);
  }

  dispatch(event: Event, element: Element) {
    super.dispatch(event, element);
    this.tick();
  }
}
