import { AngularContext } from "app/to-replace/test-context/angular-context";

export abstract class ComponentContext extends AngularContext {
  selectRadio(element: HTMLInputElement) {
    element.click();
    element.dispatchEvent(new Event("change", { bubbles: true }));
    this.tick();
  }

  click(element: HTMLElement) {
    element.click();
    this.tick();
  }
}
