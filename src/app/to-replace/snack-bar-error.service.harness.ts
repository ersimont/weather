import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { assert } from '@s-libs/js-core';
import { expectSingleCallAndReset } from '@s-libs/ng-dev';

export class SnackBarErrorServiceHarness {
  private spy?: jasmine.Spy;

  constructor(private ctx: AngularContext) {}

  install() {
    assert(!this.spy, 'already installed');
    this.spy = spyOn(this.ctx.inject(SnackBarErrorService), 'show');
  }

  expectGeneric() {
    this.expect('There was an unexpected error');
  }

  expect(message: string) {
    assert(this.spy, 'not installed');
    expectSingleCallAndReset(this.spy, message);
  }

  verify() {
    assert(this.spy, 'not installed');
    expect(this.spy).not.toHaveBeenCalled();
  }
}
