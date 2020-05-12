import { TestElement } from '@angular/cdk/testing';
import { ModifierKeys, TestKey } from '@angular/cdk/testing/test-element';
import { tick } from '@angular/core/testing';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type Synchronized<T extends (...args: any[]) => Promise<any>> = (
  ...args: Parameters<T>
) => ThenArg<ReturnType<T>>;
type SynchronizedTestElement = {
  [K in keyof TestElement]: Synchronized<TestElement[K]>;
};

export class FakeAsyncTestElement implements SynchronizedTestElement {
  constructor(private inner: TestElement) {}

  blur() {
    this.callAndTrigger('blur');
  }

  clear() {
    this.callAndTrigger('clear');
  }

  click(relativeX?: number, relativeY?: number) {
    this.callAndTrigger('click', relativeX, relativeY);
  }

  focus() {
    this.callAndTrigger('focus');
  }

  getCssValue(property: string) {
    return this.callAndTrigger('getCssValue', property);
  }

  hover() {
    this.callAndTrigger('hover');
  }

  sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]) {
    this.callAndTrigger('sendKeys', modifiers, ...keys);
  }

  text() {
    return this.callAndTrigger('text');
  }

  getAttribute(name: string) {
    return this.callAndTrigger('getAttribute', name);
  }

  hasClass(name: string) {
    return this.callAndTrigger('hasClass', name);
  }

  getDimensions() {
    return this.callAndTrigger('getDimensions');
  }

  getProperty(name: string) {
    return this.callAndTrigger('getProperty', name);
  }

  matchesSelector(selector: string) {
    return this.callAndTrigger('matchesSelector', selector);
  }

  isFocused() {
    return this.callAndTrigger('isFocused');
  }

  private callAndTrigger<K extends keyof TestElement>(
    key: K,
    ...args: Parameters<TestElement[K]>
  ) {
    // TODO: detect when promise doesn't resolve and print a helpful message about calling tick()
    let result: ThenArg<ReturnType<TestElement[K]>>;
    (this.inner[key] as any)(...args).then((r: any) => (result = r));
    tick();
    return result!;
  }
}
