import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  MatButtonModule,
  MatExpansionModule,
  MatIconModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
} from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { NasModelModule, ngAppStateReducer } from "ng-app-state";
import { ChartsModule } from "ng2-charts";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { GraphComponent } from "./graph/graph.component";
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
    MatExpansionModule,
    MatIconModule,
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
