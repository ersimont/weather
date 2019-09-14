import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { HttpClientModule } from "@angular/common/http";
import { ChartsModule } from "ng2-charts";
import { GraphComponent } from "./graph/graph.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [AppComponent, GraphComponent],
  imports: [
    BrowserModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
