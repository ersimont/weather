import { Source, SourceId } from "./source";
import { GpsCoords } from "../gps-coords.service";
import { mapToObject } from "../to-replace/map-to-object";
import { Condition } from "./condition";

export class WeatherState {
  version = 3;
  gpsCoords?: GpsCoords;

  sources: Record<SourceId, Source> = {
    weatherGov: new Source("Weather.gov", true),
    weatherUnlocked: new Source("Weather Unlocked", false),
  };

  showConditions: Record<Condition, boolean> = mapToObject(
    Condition,
    (condition: Condition) => [condition, true],
  ) as any;
}
