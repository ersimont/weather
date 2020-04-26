import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("WeatherUnlocked", () => {
  WeatherGraphContext.setup();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let unlocked: WeatherUnlockedHarness;
  let sources: SourceOptionsComponentHarness;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ctx.initialState.sources.weatherGov.show = false;
    ctx.initialState.sources.weatherUnlocked.show = true;
  });

  function init() {
    ctx.init();
    iq = new LocationIqServiceHarness(ctx);
    unlocked = new WeatherUnlockedHarness(ctx);
    sources = new SourceOptionsComponentHarness(ctx);
  }

  it("can cancel its request", fakeAsync(() => {
    init();

    iq.flushReverse();
    sources.toggle("Weather Unlocked");
    expect(unlocked.expectForecast().isCancelled()).toBe(true);

    sources.toggle("Weather Unlocked");
    unlocked.flushFixture();

    ctx.cleanup();
  }));
});
