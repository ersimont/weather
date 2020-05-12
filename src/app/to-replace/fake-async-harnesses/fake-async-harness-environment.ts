import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { flush, tick } from '@angular/core/testing';
import { bindKey } from 'micro-dash';

export class FakeAsyncHarnessEnvironment extends HarnessEnvironment<Element> {
  async waitForTasksOutsideAngular() {
    flush();
  }

  async forceStabilize() {
    tick();
  }

  protected createEnvironment(element: Element) {
    return new FakeAsyncHarnessEnvironment(element);
  }

  protected createTestElement(element: Element) {
    return new UnitTestElement(element, bindKey(this, 'forceStabilize'));
  }

  protected async getAllRawElements(selector: string) {
    return Array.from(this.rawRootElement.querySelectorAll(selector));
  }

  protected getDocumentRoot() {
    return document.body;
  }
}
