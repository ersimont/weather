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
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from 'app/app.component';
import { GraphComponent } from 'app/misc-components/graph/graph.component';
import { OptionsModule } from 'app/options/options.module';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { provideHttpStatus } from 'app/to-replace/http-status.service';
import { provideErrorHandler } from 'app/to-replace/snack-bar-error.service';
import { WhatsNewComponent } from 'app/upgrade/whats-new.component';
import { ngAppStateReducer } from 'ng-app-state';
import { environment } from '../environments/environment';
import { AboutComponent } from './misc-components/about/about.component';
import { PrivacyPolicyComponent } from './misc-components/privacy-policy/privacy-policy.component';

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    GraphComponent,
    WhatsNewComponent,
    PrivacyPolicyComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    EventTrackingModule.forRoot({
      gaProperty: environment.gaProperty,
      // TODO: move to booleans
      log: environment.name === 'development',
    }),
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
    ServiceWorkerModule.register('ngsw-worker.js', {
      // TODO: move to booleans
      enabled: environment.name === 'production',
      registrationStrategy: 'registerWithDelay',
    }),
    StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
    // TODO: move to booleans
    environment.name === 'development' ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [provideErrorHandler(), provideHttpStatus()],
  bootstrap: [AppComponent],
  exports: [AppComponent],
})
export class AppModule {}
