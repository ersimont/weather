import { Injectable } from "@angular/core";
import { fromPromise } from "rxjs/internal-compatibility";
import { cache } from "s-rxjs-utils";

export type GpsCoords = [number, number];

@Injectable({ providedIn: "root" })
export class GpsCoordsService {
  $ = fromPromise(getCurrentGpsCoords()).pipe(cache());
  // $ = of<GpsCoords>([39.7456, -97.0892]);
}

export function getCurrentGpsCoords() {
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
