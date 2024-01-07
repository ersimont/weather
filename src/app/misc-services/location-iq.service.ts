import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GpsCoords, Location } from 'app/state/location';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const baseUrl =
  'https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1';
const commonParams = {
  format: 'json',
  addressdetails: '1',
  normalizecity: '1',
  statecode: '1',
};

export type ForwardResponse = LocationResponse[];

export interface LocationResponse {
  lat: string;
  lon: string;
  address: Address;
}

export interface TimezoneResponse {
  timezone: { name: string };
}

export interface Address {
  city?: string;
  city_district?: string;
  town?: string;
  village?: string;
  suburb?: string;
  hamlet?: string;
  neighbourhood?: string;
  road?: string;
  state_code?: string;
  state?: string;
  country_code?: string;
}

export type LocationPatch = Pick<Location, 'gpsCoords' | 'city'>;

@Injectable({ providedIn: 'root' })
export class LocationIqService {
  constructor(private httpClient: HttpClient) {}

  forward(search: string): Observable<LocationPatch> {
    return this.httpClient
      .get<ForwardResponse>(`${baseUrl}/search.php`, {
        params: { ...commonParams, q: search, limit: '1' },
      })
      .pipe(map((response) => parseLocation(response[0])));
  }

  reverse(gpsCoords: GpsCoords): Observable<LocationPatch> {
    return this.httpClient
      .get<LocationResponse>(`${baseUrl}/reverse.php`, {
        params: {
          ...commonParams,
          lat: gpsCoords[0].toString(),
          lon: gpsCoords[1].toString(),
        },
      })
      .pipe(map(parseLocation));
  }

  timezone(gpsCoords: GpsCoords): Observable<string> {
    return this.httpClient
      .get<TimezoneResponse>(`${baseUrl}/timezone.php`, {
        params: {
          lat: gpsCoords[0].toString(),
          lon: gpsCoords[1].toString(),
        },
      })
      .pipe(map((response) => response.timezone.name));
  }
}

function parseLocation(response: LocationResponse): LocationPatch {
  return {
    gpsCoords: [+response.lat, +response.lon],
    city: parseCity(response.address),
  };
}

function parseCity(address: Address): string {
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

  return [city, state].filter(Boolean).join(', ');
}
