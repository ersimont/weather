import { fakeAsync } from "@angular/core/testing";
import { UnitOptionsComponentHarness } from "app/options/unit-options/unit-options.component.harness";
import { AmountUnit } from "app/state/units";
import { WeatherStoreHarness } from "app/state/weather-store.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("WeatherStore", () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let store: WeatherStoreHarness;
  let units: UnitOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ store, units } = ctx.harnesses);
  });

  it("persists changes to the state", fakeAsync(() => {
    ctx.initialState.units.amount = AmountUnit.IN;
    ctx.init();

    units.select("MM");

    expect(store.getPersistedState().units.amount).toBe(AmountUnit.MM);

    ctx.cleanUp();
  }));
});
