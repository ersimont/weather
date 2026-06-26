import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideServiceWorker } from '@angular/service-worker';
import { GraphModule } from 'app/graph/graph.module';
import { OptionsModule } from 'app/options/options.module';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';
import { trackHttpStatus } from 'app/to-replace/http-status.service';
import { EventTrackingModule } from 'app/to-replace/mixpanel-core/event-tracking.module';
import { provideErrorHandler } from 'app/to-replace/snack-bar-error.service';
import { environment } from '@env';

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
    provideHttpClient(withXhr(), withInterceptors([trackHttpStatus])),
    provideErrorHandler(),
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { autoFocus: 'dialog' } },
    environment.bugsnagConfig ? provideBugsnag(environment.bugsnagConfig) : [],
    importProvidersFrom(
      EventTrackingModule.forRoot(environment.eventTrackingConfig),
      GraphModule,
      MatDialogModule,
      MatSnackBarModule,
      OptionsModule,
    ),
  ],
};
