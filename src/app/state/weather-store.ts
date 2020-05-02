import { Injectable } from "@angular/core";
import { PersistenceService } from "app/misc-services/persistence.service";
import { AppStore } from "ng-app-state";
import { Store } from "@ngrx/store";
import { WeatherState } from "./weather-state";

@Injectable({ providedIn: "root" })
export class WeatherStore extends AppStore<WeatherState> {
  constructor(ngrxStore: Store<any>, persistenceService: PersistenceService) {
    super(ngrxStore, "weather", persistenceService.getInitialValue());
    persistenceService.start(this);
  }
}
