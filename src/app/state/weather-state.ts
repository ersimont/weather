import { Condition } from 'app/state/condition';
import { Location } from 'app/state/location';
import { Source, SourceId } from 'app/state/source';
import { Units } from 'app/state/units';
import { ViewRange } from 'app/state/viewRange';
import { mapToObject } from 's-js-utils';

export class WeatherState {
  _version = 9;

  useCurrentLocation = false;
  currentLocation = new Location();
  customLocation = new Location();

  allowSourceFallback = true;
  sources: { [source in SourceId]: Source } = {
    climacell: new Source('Climacell', false),
    openWeather: new Source('OpenWeather', false),
    weatherGov: new Source('Weather.gov', true),
    weatherUnlocked: new Source('Weather Unlocked', false),
  };

  units = new Units();

  showConditions = mapToObject(Condition, (condition: Condition) => [
    condition,
    true,
  ]) as Record<Condition, boolean>;

  viewRange = new ViewRange(1);
}
