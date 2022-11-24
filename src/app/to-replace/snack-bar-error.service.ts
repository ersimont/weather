import {
  ErrorHandler,
  Inject,
  Injectable,
  Optional,
  Provider,
} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BugsnagErrorHandler } from '@bugsnag/plugin-angular';
import { bugsnagToken } from 'app/to-replace/bugsnag/bugsnag.module';

export function provideErrorHandler(): Provider {
  return { provide: ErrorHandler, useExisting: SnackBarErrorService };
}

@Injectable({ providedIn: 'root' })
export class SnackBarErrorService implements ErrorHandler {
  constructor(
    @Inject(bugsnagToken)
    @Optional()
    private bugsnag: BugsnagErrorHandler | undefined,
    private matSnackBar: MatSnackBar,
  ) {}

  handleError(error: any, { logUnexpected = true } = {}): void {
    if (error.rejection) {
      error = error.rejection;
    }

    if (logUnexpected) {
      if (this.bugsnag) {
        this.bugsnag?.handleError(error.message ?? error);
      } else {
        console.error(error);
      }
    }
    const message = 'There was an unexpected error';
    this.show(message);
  }

  show(message: string): void {
    this.matSnackBar.open(message, 'OK', { duration: 5000 });
  }
}
