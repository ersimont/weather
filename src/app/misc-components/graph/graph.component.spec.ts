import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { TempUnit } from 'app/state/units';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('GraphComponent', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let state: WeatherStateHarness;
  let units: UnitOptionsComponentHarness;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ graph, gov, iq, state, units, unlocked } = ctx.harnesses);
  });

  describe('tooltip', () => {
    it('displays the condition and value in its label', () => {
      const timeframe = unlocked.buildTimeframe({ temp_c: 21.6 });
      state.setShowing(SourceId.WEATHER_UNLOCKED);
      ctx.initialState.units.temp = TempUnit.C;
      ctx.run({ flushDefaultRequests: false }, () => {
        iq.flushReverse();
        unlocked
          .expectForecast()
          .flush(unlocked.buildResponse({}, { timeframe }));

        expect(
          graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
        ).toBe('Temp: 22 °C');
        units.select('°F');
        expect(
          graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
        ).toBe('Temp: 71 °F');
      });
    });

    it('displays the source in its footer', () => {
      state.setShowing(SourceId.WEATHER_GOV, SourceId.WEATHER_UNLOCKED);
      ctx.run({ flushDefaultRequests: false }, () => {
        iq.flushReverse();
        gov.flushFixture();
        unlocked.flushDefault();

        expect(graph.getTooltipFooter(SourceId.WEATHER_GOV)).toBe(
          'Source: Weather.gov',
        );
        units.select('°F');
        expect(graph.getTooltipFooter(SourceId.WEATHER_UNLOCKED)).toBe(
          'Source: Weather Unlocked',
        );
      });
    });
  });
});
