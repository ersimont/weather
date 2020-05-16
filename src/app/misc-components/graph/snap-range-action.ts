import { OperatorFunction } from 'rxjs';
import { Action } from '@ngrx/store';
import { filter } from 'rxjs/operators';

// TODO: move to event service
export class SnapRangeAction {
  static filter = filter(
    ({ type }) => type === 'SNAP_RANGE',
  ) as OperatorFunction<Action, SnapRangeAction>;

  readonly type = 'SNAP_RANGE';

  constructor(public days: number) {}
}
