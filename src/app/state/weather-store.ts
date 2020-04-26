import { Injectable } from "@angular/core";
import { AppStore } from "ng-app-state";
import { Store } from "@ngrx/store";
import { WeatherState } from "./weather-state";

const key = "weather";

@Injectable({ providedIn: "root" })
export class WeatherStore extends AppStore<WeatherState> {
  constructor(ngrxStore: Store<any>) {
    super(ngrxStore, key, getInitialValue());
    this.$.subscribe((state) => {
      localStorage.setItem(key, JSON.stringify(state));
    });
  }
}

function getInitialValue() {
  const fresh = new WeatherState();
  const savedStr = localStorage.getItem(key);
  if (!savedStr) {
    return fresh;
  }

  const saved = JSON.parse(savedStr);
  return saved.version === fresh.version ? saved : fresh;
}
