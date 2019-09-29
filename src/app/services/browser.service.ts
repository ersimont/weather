import { Injectable } from "@angular/core";
import { GpsCoords } from "../state/location";

@Injectable({ providedIn: "root" })
export class BrowserService {
  getCurrentLocation() {
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
        () => {
          reject("Error retrieving current location");
        },
      );
    });
  }
}
