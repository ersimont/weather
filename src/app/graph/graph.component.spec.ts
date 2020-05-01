import { fakeAsync } from "@angular/core/testing";
import { GraphComponentHarness } from "app/graph/graph.component.harness";
import { UnitOptionsComponentHarness } from "app/options/unit-options/unit-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked.harness";
import { Condition } from "app/state/condition";
import { SourceId } from "app/state/source";
import { TempUnit } from "app/state/units";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("GraphComponent", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let gov: WeatherGovHarness;
  let graph: GraphComponentHarness;
  let iq: LocationIqServiceHarness;
  let units: UnitOptionsComponentHarness;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ graph, gov, iq, units, unlocked } = ctx.harnesses);
  });

  describe("tooltip", () => {
    it("displays the condition and value in its label", fakeAsync(() => {
      const timeframe = unlocked.buildTimeframe({ temp_c: 21.6 });
      ctx.initialState.sources.weatherUnlocked.show = true;
      ctx.initialState.sources.weatherGov.show = false;
      ctx.initialState.units.temp = TempUnit.C;
      ctx.init();
      iq.flushReverse();
      unlocked
        .expectForecast()
        .flush(unlocked.buildResponse({}, { timeframe }));

      expect(
        graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
      ).toBe("Temp: 22 °C");
      units.select("°F");
      expect(
        graph.getTooltipLabel(SourceId.WEATHER_UNLOCKED, Condition.TEMP, 0),
      ).toBe("Temp: 71 °F");

      ctx.cleanUp();
    }));

    it("displays the source in its footer", fakeAsync(() => {
      ctx.initialState.sources.weatherUnlocked.show = true;
      ctx.initialState.sources.weatherGov.show = true;
      ctx.init();
      iq.flushReverse();
      gov.flushFixture();
      unlocked.flushFixture();

      expect(graph.getTooltipFooter(SourceId.WEATHER_GOV)).toBe(
        "Source: Weather.gov",
      );
      units.select("°F");
      expect(graph.getTooltipFooter(SourceId.WEATHER_UNLOCKED)).toBe(
        "Source: Weather Unlocked",
      );

      ctx.cleanUp();
    }));
  });
});
