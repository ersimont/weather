import { fakeAsync } from '@angular/core/testing';
import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('unitInfo', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let climacell: ClimacellHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ climacell, graph, iq, state } = ctx.harnesses);
  });

  it('rounds MM precipitation to 1 decimal place', fakeAsync(() => {
    state.setShowing(SourceId.CLIMACELL);
    ctx.initialState.units.amount = AmountUnit.MM;
    ctx.init({ flushDefaultRequests: false });
    iq.flushReverse();
    climacell
      .expectHourly()
      .flush(
        climacell.buildHourlyResponse([
          climacell.buildTimeframe({ precipitation: { value: 0.06 } }),
        ]),
      );

    expect(
      graph.getTooltipLabel(SourceId.CLIMACELL, Condition.AMOUNT, 0),
    ).toContain('0.1 mm');

    ctx.cleanUp();
  }));
});
