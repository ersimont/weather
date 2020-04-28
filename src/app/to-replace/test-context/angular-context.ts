import { HttpTestingController } from "@angular/common/http/testing";
import { AbstractType, InjectionToken, NgZone, Type } from "@angular/core";
import { discardPeriodicTasks, TestBed } from "@angular/core/testing";
import { SpectatorHost } from "@ngneat/spectator";
import { DomContext } from "app/to-replace/test-context/dom-context";

export abstract class AngularContext extends DomContext {
  abstract spectator: SpectatorHost<unknown>;

  static setUp() {
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
    this.spectator.tick(millis);
    let extra = 0;
    for (const zone = this.inject(NgZone); !zone.isStable; ) {
      console.log("extra", ++extra);
      this.spectator.tick(0);
    }
  }

  dispatch(event: Event, element: Element) {
    super.dispatch(event, element);
    this.tick();
  }
}
