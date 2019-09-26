import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GpsCoords, Location } from "app/state/location";
import { WeatherStore } from "app/state/weather-store";
import { identity } from "micro-dash";
import { map, pluck, switchMap } from "rxjs/operators";

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
  $ = this.store("useCurrentLocation").$.pipe(
    switchMap(
      (useCurrent) =>
        this.store(useCurrent ? "currentLocation" : "customLocation").$,
    ),
  );

  constructor(private httpClient: HttpClient, private store: WeatherStore) {}

  getLocation() {
    const state = this.store.state();
    return state.useCurrentLocation
      ? state.currentLocation
      : state.customLocation;
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
  return map(
    (res: any): Partial<Location> => ({
      gpsCoords: [res.lat, res.lon],
      city: parseCity(res.address),
    }),
  );
}

function parseCity(address: any) {
  const city =
    address.city ||
    address.city_district ||
    address.town ||
    address.village ||
    address.suburb ||
    address.hamlet ||
    address.neighbourhood ||
    address.road;
  let state = address.state_code || address.country_code;
  if (state) {
    state = state.toUpperCase();
  } else {
    state = address.state || address.country;
  }
  return [city, state].filter(identity).join(", ");
}

function getCurrentCoords() {
  return new Promise<GpsCoords>((resolve, reject) => {
    // resolve([39.7456, -97.0892]);
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
