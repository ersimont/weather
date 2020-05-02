import { Condition } from "app/state/condition";
import { Location } from "app/state/location";
import { Source, SourceId } from "app/state/source";
import { Units } from "app/state/units";
import { mapToObject } from "s-js-utils";

export class WeatherState {
  version = 6;

  allowSourceFallback = true;
  useCurrentLocation = true;
  currentLocation = new Location();
  customLocation = new Location();

  // TODO: update existing states in localstorage to include climacell
  sources: Record<SourceId, Source> = {
    climacell: new Source("Climacell", false),
    weatherGov: new Source("Weather.gov", true),
    weatherUnlocked: new Source("Weather Unlocked", false),
  };

  units = new Units();

  showConditions = mapToObject(Condition, (condition: Condition) => [
    condition,
    true,
  ]) as Record<Condition, boolean>;
}
