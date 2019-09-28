import { Action } from "@ngrx/store";
import { filter } from "rxjs/operators";

export function ofType(type: string) {
  return filter((action: Action) => action.type === type);
}
