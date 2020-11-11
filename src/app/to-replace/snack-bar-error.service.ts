import { Injectable, ErrorHandler, Provider } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';

export function provideErrorHandler(): Provider {
  return { provide: ErrorHandler, useExisting: SnackBarErrorService };
}

@Injectable({ providedIn: 'root' })
export class SnackBarErrorService implements ErrorHandler {
  constructor(
    private eventTrackingService: EventTrackingService,
    private matSnackBar: MatSnackBar,
  ) {}

  handleError(error: any, { logUnexpected = true } = {}): void {
    if (error.rejection) {
      error = error.rejection;
    }

    let message;
    if (error instanceof PresentableError) {
      message = error.message;
    } else {
      if (logUnexpected) {
        console.error(error);
        this.eventTrackingService.sendError(error.message || error);
      }
      message = 'There was an unexpected error';
    }
    this.show(message);
  }

  show(message: string): void {
    this.matSnackBar.open(message, 'OK', { duration: 5000 });
  }
}

export class PresentableError extends Error {}
