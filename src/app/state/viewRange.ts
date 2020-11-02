import { convertTime } from '@s-libs/js-core';

export class ViewRange {
  min = -convertTime(90, 'min', 'ms');
  max: number;

  constructor(days: number) {
    this.max = this.min + convertTime(days, 'd', 'ms');
  }
}
