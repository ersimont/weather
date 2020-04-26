import { HttpTestingController } from "@angular/common/http/testing";
import { AbstractType, InjectionToken, Type } from "@angular/core";
import { discardPeriodicTasks, TestBed } from "@angular/core/testing";
import { SpectatorHost } from "@ngneat/spectator";

export abstract class AngularContext {
  abstract spectator: SpectatorHost<unknown>;

  static setup() {
    afterEach(() => {
      TestBed.inject(HttpTestingController).verify();
    });
  }

  cleanup() {
    discardPeriodicTasks();
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
}
