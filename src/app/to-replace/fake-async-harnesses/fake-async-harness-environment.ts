import { HarnessEnvironment } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { flush } from '@angular/core/testing';
import {
  synchronize,
  Synchronized,
} from 'app/to-replace/fake-async-harnesses/synchronize';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { ComponentContext } from 'app/to-replace/test-context/component-context';
import { bindKey } from '@s-libs/micro-dash';

export class FakeAsyncHarnessEnvironment extends HarnessEnvironment<Element> {
  static loader(
    ctx: ComponentContext,
  ): Synchronized<FakeAsyncHarnessEnvironment> {
    return synchronize(
      new FakeAsyncHarnessEnvironment(ctx.fixture.nativeElement, ctx),
    );
  }

  static documentRootLoader(
    ctx: AngularContext,
  ): Synchronized<FakeAsyncHarnessEnvironment> {
    return synchronize(new FakeAsyncHarnessEnvironment(document.body, ctx));
  }

  protected constructor(rawRootElement: Element, private ctx: AngularContext) {
    super(rawRootElement);
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    flush();
  }

  async forceStabilize(): Promise<void> {
    this.ctx.tick();
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new FakeAsyncHarnessEnvironment(element, this.ctx);
  }

  protected createTestElement(element: Element): UnitTestElement {
    return new UnitTestElement(element, bindKey(this, 'forceStabilize'));
  }

  protected async getAllRawElements(selector: string): Promise<Element[]> {
    return Array.from(this.rawRootElement.querySelectorAll(selector));
  }

  protected getDocumentRoot(): Element {
    return document.body;
  }
}
