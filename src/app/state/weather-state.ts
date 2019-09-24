import { Condition } from "app/state/condition";
import { Location } from "app/state/location";
import { Source, SourceId } from "app/state/source";
import { Units } from "app/state/units";
import { mapToObject } from "app/to-replace/map-to-object";

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
