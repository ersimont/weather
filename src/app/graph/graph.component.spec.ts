import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { VisualCrossingHarness } from 'app/sources/visual-crossing/visual-crossing.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
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
  let crossing: VisualCrossingHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ graph, gov, iq, state, crossing } = ctx.harnesses);
  });

  describe('tooltip', () => {
    it('displays the condition and value in its label', async () => {
      const hour = crossing.buildHour({ temp: 21.6 });
      state.setShowing(SourceId.VISUAL_CROSSING);
      ctx.initialState.units.temp = TempUnit.C;
      ctx.initialState.useCurrentLocation = true;
      await ctx.run(async () => {
        await iq.flushReverse();
        await crossing
          .expectForecast()
          .flush(crossing.buildResponse({}, { hour }));

        expect(
          graph.getTooltipLabel(SourceId.VISUAL_CROSSING, Condition.TEMP, 0),
        ).toBe('Temp: 22 °C');
        const unitOptions = await ctx.getHarness(UnitOptionsComponentHarness);
        await unitOptions.select('°F');
        expect(
          graph.getTooltipLabel(SourceId.VISUAL_CROSSING, Condition.TEMP, 0),
        ).toBe('Temp: 71 °F');
      });
    });

    it('displays the source in its footer', async () => {
      ctx.initialState.useCurrentLocation = true;
      state.setShowing(SourceId.WEATHER_GOV, SourceId.VISUAL_CROSSING);
      await ctx.run(async () => {
        await iq.flushReverse();
        await gov.flushFixture();
        await crossing.flushDefault();

        expect(graph.getTooltipFooter(SourceId.WEATHER_GOV)).toBe(
          'Source: Weather.gov',
        );
        const unitOptions = await ctx.getHarness(UnitOptionsComponentHarness);
        await unitOptions.select('°F');
        expect(graph.getTooltipFooter(SourceId.VISUAL_CROSSING)).toBe(
          'Source: Visual Crossing',
        );
      });
    });
  });
});
