import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import {
  MatButtonModule,
  MatIconModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { ngAppStateReducer } from "ng-app-state";
import { ChartsModule } from "ng2-charts";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { ErrorService } from "./error-service";
import { GraphComponent } from "./graph/graph.component";
import { OptionsModule } from "./options/options.module";

@NgModule({
  declarations: [AppComponent, GraphComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ChartsModule,
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
  ],
  providers: [{ provide: ErrorHandler, useClass: ErrorService }],
  bootstrap: [AppComponent],
})
export class AppModule {}
