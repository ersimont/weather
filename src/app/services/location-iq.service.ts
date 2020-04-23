import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GpsCoords, Location } from "app/state/location";
import { map, pluck } from "rxjs/operators";

const baseUrl =
  "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1";
const commonParams = {
  format: "json",
  addressdetails: "1",
  normalizecity: "1",
  statecode: "1",
};

@Injectable({ providedIn: "root" })
export class LocationIqService {
  constructor(private httpClient: HttpClient) {}

  forward(search: string) {
    return this.httpClient
      .get<any>(`${baseUrl}/search.php`, {
        params: { ...commonParams, q: search, limit: "1" },
      })
      .pipe(pluck("0"), parseResponse())
      .toPromise();
  }

  reverse(gpsCoords: GpsCoords) {
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
  const city = [
    address.city,
    address.city_district,
    address.town,
    address.village,
    address.suburb,
    address.hamlet,
    address.neighbourhood,
    address.road,
  ].find(Boolean);

  const state = [
    address.state_code?.toUpperCase(),
    address.state,
    address.country_code?.toUpperCase(),
  ].find(Boolean);

  return [city, state].filter(Boolean).join(", ");
}
