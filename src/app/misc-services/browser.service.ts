import { Injectable } from '@angular/core';
import { GpsCoords } from 'app/state/location';

@Injectable({ providedIn: 'root' })
export class BrowserService {
  getCurrentLocation(): Promise<GpsCoords> {
    // return Promise.resolve([39.7456, -97.0892]); // Portage
    // return Promise.resolve([45.4972159, -73.6103642]); // Montreal
    return new Promise<GpsCoords>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject('Current location not available');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          reject('Error retrieving current location');
        },
      );
    });
  }

  hasFocus(): boolean {
    return document.hasFocus();
  }
}
