export type GpsCoords = [number, number];

export class Location {
  search = "";
  gpsCoords?: GpsCoords;
  city?: string;
}
