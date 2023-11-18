import { ErrorHandler, Injectable, Provider } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LazyBugsnag } from 'app/to-replace/bugsnag/lazy-bugsnag';

export function provideErrorHandler(): Provider {
  return { provide: ErrorHandler, useExisting: SnackBarErrorService };
}

@Injectable({ providedIn: 'root' })
export class SnackBarErrorService implements ErrorHandler {
  constructor(private matSnackBar: MatSnackBar) {}

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
    const message = 'There was an unexpected error';
    this.show(message);
  }

  show(message: string): void {
    this.matSnackBar.open(message, 'OK', { duration: 5000 });
  }
}
