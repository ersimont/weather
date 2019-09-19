import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { HttpClientModule } from "@angular/common/http";
import { ChartsModule } from "ng2-charts";
import { GraphComponent } from "./graph/graph.component";
import { FormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { NasModelModule, ngAppStateReducer } from "ng-app-state";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
} from "@angular/material";
import { OptionsComponent } from "./options/options.component";

@NgModule({
  declarations: [AppComponent, GraphComponent, OptionsComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    NasModelModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
    StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
    environment.production ? [] : StoreDevtoolsModule.instrument(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
