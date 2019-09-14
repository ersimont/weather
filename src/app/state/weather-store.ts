import { Injectable } from "@angular/core";
import { AppStore } from "ng-app-state";
import { Store } from "@ngrx/store";
import { WeatherState } from "./weather-state";
import { persistStore } from "../to-replace/persist-store";

@Injectable({ providedIn: "root" })
export class WeatherStore extends AppStore<WeatherState> {
  constructor(ngrxStore: Store<any>) {
    super(ngrxStore, "weather", new WeatherState());
    persistStore(this, "weather");
  }
}
