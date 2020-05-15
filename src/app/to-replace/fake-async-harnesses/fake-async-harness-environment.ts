import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { flush } from '@angular/core/testing';
import { synchronize } from 'app/to-replace/fake-async-harnesses/synchronize';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { ComponentContext } from 'app/to-replace/test-context/component-context';
import { bindKey } from 'micro-dash';

export class FakeAsyncHarnessEnvironment extends HarnessEnvironment<Element> {
  static loader(ctx: ComponentContext) {
    return synchronize(
      new FakeAsyncHarnessEnvironment(ctx.fixture.nativeElement, ctx),
    );
  }

  static documentRootLoader(ctx: AngularContext) {
    return synchronize(new FakeAsyncHarnessEnvironment(document.body, ctx));
  }

  protected constructor(rawRootElement: Element, private ctx: AngularContext) {
    super(rawRootElement);
  }

  async waitForTasksOutsideAngular() {
    flush();
  }

  async forceStabilize() {
    this.ctx.tick();
  }

  protected createEnvironment(element: Element) {
    return new FakeAsyncHarnessEnvironment(element, this.ctx);
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
