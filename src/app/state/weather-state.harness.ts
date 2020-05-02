import { SourceId } from "app/state/source";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { forOwn } from "micro-dash";

export class WeatherStateHarness {
  constructor(private ctx: WeatherGraphContext) {}

  setShowing(...sourceIds: SourceId[]) {
    forOwn(this.ctx.initialState.sources, (source, id) => {
      source.show = sourceIds.includes(id);
    });
  }
}
