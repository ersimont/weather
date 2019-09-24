import { Injectable, ErrorHandler } from "@angular/core";
import { MatSnackBar } from "@angular/material";

@Injectable()
export class ErrorService implements ErrorHandler {
  constructor(private matSnackBar: MatSnackBar) {}

  handleError(error: any) {
    let message;
    if (error instanceof PresentableError) {
      message = error.message;
    } else if (error.rejection instanceof PresentableError) {
      message = error.rejection.message;
    } else {
      console.error(error);
      message = "There was an unexpected error";
    }
    this.show(message);
  }

  show(message: string) {
    this.matSnackBar.open(message, "OK", { duration: 5000 });
  }
}

export class PresentableError extends Error {
  constructor(message: string) {
    super(message);
  }
}
