import { HttpTestingController } from "@angular/common/http/testing";
import { discardPeriodicTasks, TestBed } from "@angular/core/testing";

export class AngularContext {
  static setup() {
    afterEach(() => {
      TestBed.get(HttpTestingController).verify();
    });
  }

  cleanup() {
    discardPeriodicTasks();
  }
}
