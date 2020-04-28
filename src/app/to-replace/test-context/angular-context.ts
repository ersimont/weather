import { HttpTestingController } from "@angular/common/http/testing";
import { AbstractType, InjectionToken, Type } from "@angular/core";
import { discardPeriodicTasks, TestBed } from "@angular/core/testing";
import { SpectatorHost } from "@ngneat/spectator";
import { DomContext } from "app/to-replace/test-context/dom-context";

export abstract class AngularContext extends DomContext {
  abstract spectator: SpectatorHost<unknown>;

  static setup() {
    afterEach(() => {
      TestBed.inject(HttpTestingController).verify();
    });
  }

  cleanUp() {
    discardPeriodicTasks();
    this.tick(1); // the CDK does this for its FocusManager
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>) {
    return TestBed.inject(token);
  }

  tick(millis?: number) {
    for (let i = 2; --i >= 0; ) {
      this.spectator.tick(millis);
      millis = 0;
    }
  }

  dispatch(event: Event, element: Element) {
    super.dispatch(event, element);
    this.tick();
  }
}
