import { Source, SourceId } from "./source";
import { GpsCoords } from "../gps-coords.service";

export class WeatherState {
  gpsCoords?: GpsCoords;

  sources: Record<SourceId, Source> = {
    weatherGov: new Source("Weather.gov", true),
    weatherUnlocked: new Source("Weather Unlocked", false),
  };
}
