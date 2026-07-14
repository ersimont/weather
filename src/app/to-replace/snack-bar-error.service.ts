import { ErrorHandler, inject, Provider, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BugsnagService } from 'app/to-replace/bugsnag/bugsnag.service';
import { toNotifiableError } from 'app/to-replace/bugsnag/to-notifiable-error';

export function provideSnackBarErrorHandler(): Provider {
  return { provide: ErrorHandler, useExisting: SnackBarErrorService };
}

@Service()
export class SnackBarErrorService implements ErrorHandler {
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #bugsnag = inject(BugsnagService, { optional: true });

  handleError(error: unknown, { logUnexpected = true } = {}): void {
    if (logUnexpected) {
      if (typeof error === 'object' && error !== null && 'rejection' in error) {
        error = error.rejection;
      }
      if (this.#bugsnag) {
        this.#bugsnag.notify(toNotifiableError(error));
      } else {
        console.error(error);
      }
    }
    this.show('There was an unexpected error');
  }

  show(message: string): void {
    this.#matSnackBar.open(message, 'OK', { duration: 5000 });
  }
}
