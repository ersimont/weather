import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { VisualCrossingHarness } from 'app/sources/visual-crossing/visual-crossing.harness';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('unitInfo', () => {
  let ctx: WeatherGraphContext;
  let crossing: VisualCrossingHarness;
  let graph: GraphComponentHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ crossing, graph, state } = ctx.harnesses);
  });

  it('rounds MM precipitation to 1 decimal place', () => {
    state.setCustomLocation();
    state.setShowing(SourceId.VISUAL_CROSSING);
    ctx.initialState.units.amount = AmountUnit.MM;
    ctx.run(() => {
      crossing
        .expectForecast()
        .flush(
          crossing.buildResponse(
            {},
            { hour: crossing.buildHour({ precip: 0.06 }) },
          ),
        );

      expect(
        graph.getTooltipLabel(SourceId.VISUAL_CROSSING, Condition.AMOUNT, 0),
      ).toContain('0.1 mm');
    });
  });
});
