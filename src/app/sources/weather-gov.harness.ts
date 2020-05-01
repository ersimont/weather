import { GridResponse, PointResponse } from "app/sources/weather-gov";
import {
  gridResponse,
  notAvailableResponse,
  pointResponse,
} from "app/sources/weather-gov.fixtures";
import { STestRequest } from "app/test-helpers/s-test-request";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

export class WeatherGovHarness {
  constructor(private ctx: WeatherGraphContext) {}

  flushFixture(gpsCoordinates = this.ctx.currentLocation) {
    this.expectPoints(gpsCoordinates).flush(pointResponse);
    this.expectGrid().flush(gridResponse);
  }

  flushNotAvailable() {
    this.expectPoints().flush(pointResponse);
    this.expectGrid().flushError(404, { body: notAvailableResponse });
  }

  expectPoints(gpsCoordinates = this.ctx.currentLocation) {
    return new STestRequest<PointResponse>(
      "GET",
      `https://api.weather.gov/points/${gpsCoordinates.join(",")}`,
      this.ctx,
    );
  }

  expectGrid(url = pointResponse.properties.forecastGridData) {
    return new STestRequest<GridResponse>("GET", url, this.ctx);
  }

  expectNotAvailableError() {
    this.ctx.expectErrorShown(
      "Weather.gov is not available here. Try another source (in the settings).",
    );
  }
}
