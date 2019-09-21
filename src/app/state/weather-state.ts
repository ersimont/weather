import { GpsCoords } from "../gps-coords.service";
import { mapToObject } from "../to-replace/map-to-object";
import { Condition } from "./condition";
import { Source, SourceId } from "./source";
import { Units } from "./units";

export class WeatherState {
  version = 4;
  gpsCoords?: GpsCoords;

  sources: Record<SourceId, Source> = {
    weatherGov: new Source("Weather.gov", true),
    weatherUnlocked: new Source("Weather Unlocked", false),
  };

  units = new Units();

  showConditions: Record<Condition, boolean> = mapToObject(
    Condition,
    (condition: Condition) => [condition, true],
  ) as any;
}
