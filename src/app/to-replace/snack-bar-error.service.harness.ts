import { SnackBarErrorService } from 'app/to-replace/snack-bar-error.service';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { assert } from 's-js-utils';
import { expectSingleCallAndReset } from 's-ng-dev-utils';

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
