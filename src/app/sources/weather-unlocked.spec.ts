import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("WeatherUnlocked", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let sources: SourceOptionsComponentHarness;
  let unlocked: WeatherUnlockedHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, sources, unlocked } = ctx.harnesses);

    ctx.initialState.sources.weatherGov.show = false;
    ctx.initialState.sources.weatherUnlocked.show = true;
  });

  it("can cancel its request", fakeAsync(() => {
    ctx.init();

    iq.flushReverse();
    sources.toggle("Weather Unlocked");
    expect(unlocked.expectForecast().isCancelled()).toBe(true);

    sources.toggle("Weather Unlocked");
    unlocked.flushFixture();

    ctx.cleanUp();
  }));

  it("rounds gps coordinates to 3 decimal places", fakeAsync(() => {
    ctx.currentLocation = [12.3456, 65.4321];
    ctx.init();

    iq.flushReverse();
    unlocked.expectForecast([12.346, 65.432]);

    ctx.cleanUp();
  }));
});
