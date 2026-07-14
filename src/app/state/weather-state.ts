import { mapToObject } from '@s-libs/js-core';
import { Condition } from 'app/state/condition';
import { Location } from 'app/state/location';
import { Source, SourceId } from 'app/state/source';
import { Units } from 'app/state/units';
import { ViewRange } from 'app/state/view-range';

export class WeatherState {
  _version = 13;

  useCurrentLocation = false;
  currentLocation = new Location();
  customLocation = new Location();

  allowSourceFallback = true;
  sources: Record<SourceId, Source> = {
    openWeather: new Source('OpenWeather', false),
    visualCrossing: new Source('Visual Crossing', false),
    weatherGov: new Source('Weather.gov', true),
  };

  units = new Units();

  showConditions = mapToObject(Condition, (condition: Condition) => [
    condition,
    true,
  ]) as Record<Condition, boolean>;

  viewRange = new ViewRange(1);
}
