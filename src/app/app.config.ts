import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '@env';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';
import { trackHttpStatus } from 'app/to-replace/http-status.service';
import { provideEventTracking } from 'app/to-replace/mixpanel-core/event-tracking-config';
import { provideErrorHandler } from 'app/to-replace/snack-bar-error.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // from scaffolding
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.pwa,
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // additions
    provideHttpClient(withInterceptors([trackHttpStatus])),
    provideErrorHandler(),
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { autoFocus: 'dialog' } },
    environment.bugsnagConfig ? provideBugsnag(environment.bugsnagConfig) : [],
    provideEventTracking(environment.eventTrackingConfig),
  ],
};
