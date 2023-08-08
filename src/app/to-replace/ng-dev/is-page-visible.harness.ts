import { AngularContext } from '@s-libs/ng-dev';
import { spyOnlyWithArgs } from 'app/to-replace/ng-dev/spy-only-with-args';

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
  #visibilityState: jasmine.Spy;
  #notifyVisibilityChange: VoidFunction | undefined;

  constructor() {
    this.#visibilityState = spyOnProperty(
      document,
      'visibilityState',
    ).and.returnValue('visible');

    spyOnlyWithArgs(document, 'addEventListener', [
      'visibilitychange',
      jasmine.anything(),
      undefined,
    ]).callFake((_: string, handler: EventListenerOrEventListenerObject) => {
      this.#notifyVisibilityChange = handler as VoidFunction;
    });
  }

  /**
   * Sets the page's visibility state, and triggers any subscriptions to `isPageVisible$()`. Automatically triggers change detection if running with an {@linkcode AngularContext}.
   */
  setVisible(visible: boolean): void {
    this.#visibilityState.and.returnValue(visible ? 'visible' : 'hidden');
    this.#notifyVisibilityChange?.();

    // TODO: fix and test
    if ((window as any).Zone.current.get('FakeAsyncTestZoneSpec')) {
      AngularContext.getCurrent()?.tick();
    }
  }
}
