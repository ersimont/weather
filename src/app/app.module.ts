import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatIconModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { AppComponent } from "app/app.component";
import { GraphComponent } from "app/graph/graph.component";
import { OptionsModule } from "app/options/options.module";
import { ErrorService } from "app/services/error.service";
import { EventTrackingModule } from "app/to-replace/event-tracking/event-tracking.module";
import { LoadingInterceptor } from "app/to-replace/loading-interceptor.service";
import { ngAppStateReducer } from "ng-app-state";
import { ChartsModule } from "ng2-charts";
import { wrapFunction } from "s-js-utils";
import { environment } from "../environments/environment";

@NgModule({
  declarations: [AppComponent, GraphComponent],
  imports: [
    environment.test ? NoopAnimationsModule : BrowserAnimationsModule,
    BrowserModule,
    ChartsModule,
    EventTrackingModule.forRoot(
      environment.production ? "UA-148865234-1" : "UA-148865234-2",
    ),
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    OptionsModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
    StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
    environment.production ? [] : StoreDevtoolsModule.instrument(),
    MatProgressBarModule,
  ],
  providers: [
    ErrorService,
    LoadingInterceptor,
    { provide: ErrorHandler, useExisting: ErrorService },
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  exports: [AppComponent],
})
export class AppModule {}
