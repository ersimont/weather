import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from 'app/app.component';
import { GraphModule } from 'app/graph/graph.module';
import { OptionsModule } from 'app/options/options.module';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { provideHttpStatus } from 'app/to-replace/http-status.service';
import { provideErrorHandler } from 'app/to-replace/snack-bar-error.service';
import { WhatsNewComponent } from 'app/upgrade/whats-new.component';
import { environment } from '../environments/environment';
import { AboutComponent } from './misc-components/about/about.component';
import { ManualReinstallComponent } from './misc-components/manual-reinstall/manual-reinstall.component';
import { PrivacyPolicyComponent } from './misc-components/privacy-policy/privacy-policy.component';

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    ManualReinstallComponent,
    PrivacyPolicyComponent,
    WhatsNewComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    EventTrackingModule.forRoot({
      gaProperty: environment.gaProperty,
      log: environment.logEvents,
    }),
    GraphModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    OptionsModule,
    environment.pwa
      ? ServiceWorkerModule.register('ngsw-worker.js', {
          registrationStrategy: 'registerWithDelay',
        })
      : [],
  ],
  providers: [provideErrorHandler(), provideHttpStatus()],
  bootstrap: [AppComponent],
  exports: [AppComponent],
})
export class AppModule {}
