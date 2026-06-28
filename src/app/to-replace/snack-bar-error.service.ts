import { ErrorHandler, inject, Provider, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LazyBugsnag } from 'app/to-replace/bugsnag/lazy-bugsnag';

export function provideErrorHandler(): Provider {
  return { provide: ErrorHandler, useExisting: SnackBarErrorService };
}

@Service()
export class SnackBarErrorService implements ErrorHandler {
  readonly #matSnackBar = inject(MatSnackBar);

  handleError(error: any, { logUnexpected = true } = {}): void {
    if (error.rejection) {
      error = error.rejection;
    }

    if (logUnexpected) {
      LazyBugsnag.isStarted().then((isStarted) => {
        if (isStarted) {
          LazyBugsnag.notify(error);
        } else {
          console.error(error);
        }
      });
    }
    this.show('There was an unexpected error');
  }

  show(message: string): void {
    this.#matSnackBar.open(message, 'OK', { duration: 5000 });
  }
}
