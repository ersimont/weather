import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { TempUnit } from 'app/state/units';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('GraphComponent', () => {
  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let state: WeatherStateHarness;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ graph, gov, iq, state, unlocked } = ctx.harnesses);
  });

  it('sets the time zone according to the location', () => {
    ctx.initialState.useCurrentLocation = false;
    ctx.initialState.customLocation.search = 'New Zealand';
    ctx.initialState.customLocation.gpsCoords = [-44, 171];
    ctx.initialState.customLocation.timezone = 'Pacific/Auckland';
    state.setShowing(SourceId.WEATHER_UNLOCKED);
    ctx.run(() => {
      unlocked.expectForecast([-44, 171]);
      expect(graph.getTimeZone()).toBe('NZST');

      ctx.getHarness(LocationOptionsComponentHarness).select('Current');
      iq.expectReverse();
      expect(graph.getTimeZone()).toBe('');
    });
  });

  describe('tooltip', () => {
    it('displays the condition and value in its label', () => {
      const timeframe = unlocked.buildTimeframe({ temp_c: 21.6 });
      state.setShowing(SourceId.WEATHER_UNLOCKED);
      ctx.initialState.units.temp = TempUnit.C;
      ctx.initialState.useCurrentLocation = true;
      ctx.run(() => {
        iq.flushReverse();
        unlocked
          .expectForecast()
          .flush(unlocked.buildResponse({}, { timeframe }));

        expect(
          graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
        ).toBe('Temp: 22 °C');
        ctx.getHarness(UnitOptionsComponentHarness).select('°F');
        expect(
          graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
        ).toBe('Temp: 71 °F');
      });
    });

    it('displays the source in its footer', () => {
      ctx.initialState.useCurrentLocation = true;
      state.setShowing(SourceId.WEATHER_GOV, SourceId.WEATHER_UNLOCKED);
      ctx.run(() => {
        iq.flushReverse();
        gov.flushFixture();
        unlocked.flushDefault();

        expect(graph.getTooltipFooter(SourceId.WEATHER_GOV)).toBe(
          'Source: Weather.gov',
        );
        ctx.getHarness(UnitOptionsComponentHarness).select('°F');
        expect(graph.getTooltipFooter(SourceId.WEATHER_UNLOCKED)).toBe(
          'Source: Weather Unlocked',
        );
      });
    });
  });
});
