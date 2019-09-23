import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, pluck } from "rxjs/operators";
import { WeatherStore } from "./state/weather-store";

export type GpsCoords = [number, number];

const baseUrl =
  "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1";
const commonParams = {
  format: "json",
  addressdetails: "1",
  normalizecity: "1",
  statecode: "1",
};

@Injectable({ providedIn: "root" })
export class LocationService {
  constructor(private httpClient: HttpClient, private store: WeatherStore) {}

  getGpsCoords() {
    const state = this.store.state();
    return state.useCurrentLocation
      ? state.currentLocation.gpsCoords
      : state.customLocation.gpsCoords;
  }

  async refresh() {
    const state = this.store.state();
    if (!state.useCurrentLocation) {
      return;
    }

    const gpsCoords = await getCurrentCoords();
    const res = await this.reverse(gpsCoords);
    this.store("currentLocation").assign({ gpsCoords, city: res.city });
  }

  async setCustom(search: string) {
    const locationStore = this.store("customLocation");
    locationStore.set({ search });
    if (!search) {
      return;
    }

    const res = await this.forward(search);
    locationStore.assign(res);
  }

  private forward(search: string) {
    return this.httpClient
      .get<any>(`${baseUrl}/search.php`, {
        params: { ...commonParams, q: search, limit: "1" },
      })
      .pipe(
        pluck("0"),
        parseResponse(),
      )
      .toPromise();
  }

  private reverse(gpsCoords: GpsCoords) {
    return this.httpClient
      .get(`${baseUrl}/reverse.php`, {
        params: {
          ...commonParams,
          lat: gpsCoords[0].toString(),
          lon: gpsCoords[1].toString(),
        },
      })
      .pipe(parseResponse())
      .toPromise();
  }
}

function parseResponse() {
  return map((res: any) => {
    const gpsCoords: GpsCoords = [res.lat, res.lon];
    return {
      gpsCoords,
      city: `${res.address.city}, ${res.address.state_code.toUpperCase()}`,
    };
  });
}

function getCurrentCoords() {
  return new Promise<GpsCoords>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject("Current location not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error(error.message);
        reject("Error retrieving current location");
      },
    );
  });
}
