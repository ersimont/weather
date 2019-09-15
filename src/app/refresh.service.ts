import { Injectable } from "@angular/core";
import { WeatherStore } from "./state/weather-store";
import { getCurrentGpsCoords } from "./gps-coords.service";

@Injectable({ providedIn: "root" })
export class RefreshService {
  constructor(private store: WeatherStore) {}

  async refresh() {
    this.store("gpsCoords").set(await getCurrentGpsCoords());
  }
}
