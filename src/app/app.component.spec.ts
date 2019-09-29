import { fakeAsync } from "@angular/core/testing";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

describe("AppComponent", () => {
  WeatherGraphContext.setup();

  let ctx: WeatherGraphContext;

  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it("has a title", fakeAsync(() => {
    ctx.init();

    expect("h1").toHaveText("Weather Graph");

    ctx.cleanup();
  }));
});
