import { fakeAsync } from "@angular/core/testing";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { ClimacellHarness } from "app/sources/climacell/climacell.harness";
import { SourceId } from "app/state/source";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("Climacell", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let climacell: ClimacellHarness;
  let iq: LocationIqServiceHarness;
  let sources: SourceOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ climacell, iq, sources } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.CLIMACELL);
  });

  it("can cancel its request", fakeAsync(() => {
    ctx.init();

    iq.flushReverse();
    sources.toggle("Climacell");
    expect(climacell.expectHourly().isCancelled()).toBe(true);

    sources.toggle("Climacell");
    climacell.flushDefault();

    ctx.cleanUp();
  }));
});
