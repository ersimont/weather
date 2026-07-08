import { ErrorHandler, Provider } from '@angular/core';
import { CONFIG } from 'app/to-replace/bugsnag/bugsnag-config';
import { BugsnagErrorHandler } from 'app/to-replace/bugsnag/bugsnag-error-handler';
import { BugsnagService } from 'app/to-replace/bugsnag/bugsnag.service';
import { BugsnagConfig } from './bugsnag-config';

export function provideBugsnag(config: BugsnagConfig): Provider[] {
  return [
    { provide: CONFIG, useValue: config },
    BugsnagService,
    { provide: ErrorHandler, useExisting: BugsnagErrorHandler },
  ];
}
