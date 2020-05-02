import { fakeAsync } from "@angular/core/testing";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import {
  v6Default,
  v7Default,
} from "app/misc-services/persistence.service.fixutures";
import { PersistenceServiceHarness } from "app/misc-services/persistence.service.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("PersistenceService", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let persistence: PersistenceServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, persistence } = ctx.harnesses);
  });

  it("is working with the correct current version", () => {
    // This is a sanity check that will not catch any change that should necessitate an upgrade. But it will catch some.
    expect(JSON.stringify(ctx.initialState))
      .withContext(
        "Default state changed. You need to handle it in the upgrade service.",
      )
      .toEqual(JSON.stringify(v7Default));
  });

  it("upgrades from v6", fakeAsync(() => {
    ctx.initialState = v6Default as any;
    ctx.init();
    expect(persistence.getPersistedState()).toEqual(v7Default);

    iq.expectReverse();
    ctx.cleanUp();
  }));
});
