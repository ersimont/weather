import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { forOwn } from '@s-libs/micro-dash';

export class WeatherStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  setCustomLocation(gpsCoords = this.ctx.currentLocation) {
    this.ctx.initialState.useCurrentLocation = false;
    this.ctx.initialState.customLocation = {
      gpsCoords,
      search: 'Test',
      city: 'Test City',
      timezone: 'America/Detroit',
    };
  }

  setShowing(...sourceIds: SourceId[]) {
    forOwn(this.ctx.initialState.sources, (source, id) => {
      source.show = sourceIds.includes(id);
    });
  }
}
