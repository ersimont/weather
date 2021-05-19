import { assert } from '@s-libs/js-core';
import { AngularContext, expectSingleCallAndReset } from '@s-libs/ng-dev';
import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';

export class SnackBarErrorServiceHarness {
  private spy?: jasmine.Spy;

  constructor(private ctx: AngularContext) {}

  install(): void {
    assert(!this.spy, 'already installed');
    this.spy = spyOn(this.ctx.inject(SnackBarErrorService), 'show');
  }

  expectGeneric(): void {
    this.expect('There was an unexpected error');
  }

  expect(message: string): void {
    assert(this.spy, 'not installed');
    expectSingleCallAndReset(this.spy, message);
  }

  verify(): void {
    assert(this.spy, 'not installed');
    expect(this.spy).not.toHaveBeenCalled();
  }
}
