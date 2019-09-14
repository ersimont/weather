import { Component } from "@angular/core";
import { WeatherState } from "./state/weather-state";
import { StoreObject } from "ng-app-state";
import { WeatherStore } from "./state/weather-store";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  store: StoreObject<WeatherState>;

  constructor(store: WeatherStore) {
    this.store = store.withCaching();
  }
}
