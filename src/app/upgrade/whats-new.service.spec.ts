import { fakeAsync } from "@angular/core/testing";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { EventTrackingServiceHarness } from "app/to-replace/event-tracking/event-tracking.service.harness";
import { v6Default } from "app/upgrade/upgrade.service.fixutures";

describe("WhatsNewService", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events } = ctx.harnesses);
  });

  it("tracks an event when shown", fakeAsync(() => {
    ctx.initialState = v6Default as any;
    ctx.init();

    const tracked = events.getEvents({ name: "show_whats_new" });
    expect(tracked.length).toBe(1);
    expect(tracked[0].interaction).toBe(false);

    ctx.cleanUp();
  }));
});
