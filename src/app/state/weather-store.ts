import { Injectable } from "@angular/core";
import { AppStore } from "ng-app-state";
import { Store } from "@ngrx/store";
import { WeatherState } from "./weather-state";

const key = "weather";

@Injectable({ providedIn: "root" })
export class WeatherStore extends AppStore<WeatherState> {
  constructor(ngrxStore: Store<any>) {
    super(ngrxStore, key, rehydrate());
    this.$.subscribe((state) => {
      localStorage.setItem(key, JSON.stringify(state));
    });
  }
}

function rehydrate(): WeatherState {
  const initialValue = localStorage.getItem(key);
  if (initialValue) {
    return JSON.parse(initialValue);
  } else {
    return new WeatherState();
  }
}
