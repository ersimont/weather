import { distinctUntilChanged, fromEvent, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * Creates an observable that emits when the [page visibility]{@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API} changes. It also emits the current visibility immediately upon subscription.
 *
 * ```ts
 * isPageVisible$().subscribe((isVisible) => {
 *   if (isVisible) {
 *     console.log('Page is visible');
 *   } else {
 *     console.log('Page is hidden');
 *   }
 * });
 * ```
 */
export function isPageVisible$(): Observable<boolean> {
  return fromEvent(document, 'visibilitychange').pipe(
    startWith(undefined),
    map(() => document.visibilityState === 'visible'),
    distinctUntilChanged(),
  );
}
