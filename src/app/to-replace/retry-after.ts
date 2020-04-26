import { ObservableInput } from "rxjs";
import { retryWhen, switchMap } from "rxjs/operators";

export function retryAfter<T>(
  project: (value: T, index: number) => ObservableInput<any>,
) {
  return retryWhen<T>((error$) => error$.pipe(switchMap(project)));
}
