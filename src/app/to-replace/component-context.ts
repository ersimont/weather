import { HttpTestingController } from "@angular/common/http/testing";
import { discardPeriodicTasks, TestBed, tick } from "@angular/core/testing";
import { SpectatorHost } from "@ngneat/spectator";

export abstract class ComponentContext {
  abstract spectator: SpectatorHost<unknown>;

  static setup() {
    afterEach(() => {
      TestBed.get(HttpTestingController).verify();
    });
  }

  cleanup() {
    discardPeriodicTasks();
  }

  selectRadio(element: HTMLInputElement) {
    element.click();
    element.dispatchEvent(new Event("change", { bubbles: true }));
    tick();
  }

  click(element: HTMLElement) {
    element.click();
    tick();
  }
}
