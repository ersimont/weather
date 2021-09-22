import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { TomorrowIoHarness } from 'app/sources/tomorrow-io/tomorrow-io-harness';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('unitInfo', () => {
  let ctx: WeatherGraphContext;
  let tomorrowIo: TomorrowIoHarness;
  let graph: GraphComponentHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ tomorrowIo, graph, state } = ctx.harnesses);
  });

  it('rounds MM precipitation to 1 decimal place', () => {
    state.setCustomLocation();
    state.setShowing(SourceId.TOMORROW_IO);
    ctx.initialState.units.amount = AmountUnit.MM;
    ctx.run(() => {
      tomorrowIo
        .expectTimelines()
        .flush(
          tomorrowIo.buildTimelinesResponse(
            {},
            { precipitationIntensity: 0.06 },
          ),
        );

      expect(
        graph.getTooltipLabel(SourceId.TOMORROW_IO, Condition.AMOUNT, 0),
      ).toContain('0.1 mm');
    });
  });
});
