import { fakeAsync } from "@angular/core/testing";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import { WeatherStoreHarness } from "app/state/weather-store.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { defaultState, v6Default } from "app/upgrade/upgrade.service.fixutures";
import { WhatsNewComponentHarness } from "app/upgrade/whats-new.component.harness";

describe("UpgradeService", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let iq: LocationIqServiceHarness;
  let store: WeatherStoreHarness;
  let whatsNew: WhatsNewComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ iq, store, whatsNew } = ctx.harnesses);
  });

  it("defaults to a fresh, up-to-date state", () => {
    // This is a sanity check that will not catch any change that should necessitate an upgrade. But it will catch some.
    expect(JSON.stringify(ctx.initialState))
      .withContext(
        "Default state changed. You need to handle it in the upgrade service.",
      )
      .toEqual(JSON.stringify(defaultState));
  });

  it("upgrades from v6, showing what's new", fakeAsync(() => {
    ctx.initialState = v6Default as any;
    ctx.init({ flushDefaultRequests: false });

    expect(store.getPersistedState()).toEqual(defaultState);
    expect(whatsNew.getFeatures()).toEqual([
      "You can get your forecast from Climacell. Check it out in the Sources section of the settings.",
    ]);

    iq.expectReverse();
    ctx.cleanUp();
  }));
});
