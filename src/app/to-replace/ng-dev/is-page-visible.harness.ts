import { AngularContext } from '@s-libs/ng-vitest';
import { Mock, onTestFinished } from 'vitest';

/**
 * Use to control {@link isPageVisible$()} in tests. Create only one per test, before anything calls `isPageVisible$()`.
 *
 * ```ts
 * const isPageVisibleHarness = new IsPageVisibleHarness();
 * isPageVisibleHarness.setVisible(false);
 *
 * const next = jasmine.createSpy();
 * isPageVisible$().subscribe(next);
 * expect(next).toHaveBeenCalledWith(false);
 *
 * isPageVisibleHarness.setVisible(true);
 * expect(next).toHaveBeenCalledWith(true);
 * ```
 *
 * It also stubs `document.visibilityState` to match.
 * ```ts
 * const isPageVisibleHarness = new IsPageVisibleHarness();
 * expect(document.visibilityState).toBe('visible');
 *
 * isPageVisibleHarness.setVisible(false);
 * expect(document.visibilityState).toBe('hidden');
 * ```
 */
export class IsPageVisibleHarness {
  #visibilityState: Mock<() => DocumentVisibilityState>;
  #listeners: VoidFunction[] = [];

  constructor() {
    this.#visibilityState = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('visible');

    const { addEventListener } = document;
    const addSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, listener, options) => {
        if (type === 'visibilitychange') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- we know that `isPageVisible$()` will only call this with a function
          this.#listeners.push(listener as VoidFunction);
        } else {
          addEventListener.call(document, type, listener, options);
        }
      });

    onTestFinished(() => {
      this.#visibilityState.mockRestore();
      addSpy.mockRestore();
    });
  }

  /**
   * Sets the page's visibility state, and triggers any subscriptions to `isPageVisible$()`. Automatically triggers change detection if running with an {@linkcode AngularContext}.
   */
  async setVisible(visible: boolean): Promise<void> {
    this.#visibilityState.mockReturnValue(visible ? 'visible' : 'hidden');
    for (const listener of this.#listeners) {
      listener();
    }
    await AngularContext.getCurrent()?.tick();
  }
}
