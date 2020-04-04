import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
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
import { provideErrorHandler } from "app/to-replace/error.service";
import { EventTrackingModule } from "app/to-replace/event-tracking/event-tracking.module";
import { provideHttpStatus } from "app/to-replace/http-status.service";
import { ngAppStateReducer } from "ng-app-state";
import { ChartsModule } from "ng2-charts";
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
  providers: [provideErrorHandler(), provideHttpStatus()],
  bootstrap: [AppComponent],
  exports: [AppComponent],
})
export class AppModule {}
