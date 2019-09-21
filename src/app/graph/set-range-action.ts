import { OperatorFunction } from "rxjs";
import { Action } from "@ngrx/store";
import { filter } from "rxjs/operators";

export class SetRangeAction {
  static filter = filter(
    ({ type }) => type === "SET_RANGE",
  ) as OperatorFunction<Action, SetRangeAction>;

  readonly type = "SET_RANGE";

  constructor(public days: number) {}
}
