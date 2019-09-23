import { mapToObject } from "../to-replace/map-to-object";
import { Condition } from "./condition";
import { Location } from "./location";
import { Source, SourceId } from "./source";
import { Units } from "./units";

export class WeatherState {
  version = 5;

  useCurrentLocation = true;
  currentLocation = new Location();
  customLocation = new Location();

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
