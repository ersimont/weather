export type GpsCoords = [number, number];

export class Location {
  gpsCoords?: GpsCoords;
  city?: string;
  timezone?: string;

  constructor(public search = '') {}
}
