export type GpsCoords = [number, number];

export class Location {
  gpsCoords?: GpsCoords;
  city?: string;
  /** We fetch the timezone for custom locations only */
  timezone?: string;

  constructor(public search = '') {}
}
