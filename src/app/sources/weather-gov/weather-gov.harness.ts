import {
  GridResponse,
  PointResponse,
} from 'app/sources/weather-gov/weather-gov';
import {
  gridResponse,
  notAvailableResponse,
  pointResponse,
} from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { STestRequest } from 'app/to-replace/test-context/s-test-request';

export class WeatherGovHarness {
  constructor(private ctx: WeatherGraphContext) {}

  flushFixture(gpsCoordinates = this.ctx.currentLocation): void {
    this.expectPoints(gpsCoordinates).flush(pointResponse);
    this.expectGrid().flush(gridResponse);
  }

  flushNotAvailable(): void {
    this.expectPoints().flush(pointResponse);
    this.expectGrid().flushError(404, { body: notAvailableResponse });
  }

  expectPoints(
    gpsCoordinates = this.ctx.currentLocation,
  ): STestRequest<PointResponse> {
    return new STestRequest<PointResponse>(
      'GET',
      `https://api.weather.gov/points/${gpsCoordinates.join(',')}`,
      this.ctx,
    );
  }

  expectGrid(
    url = pointResponse.properties.forecastGridData,
  ): STestRequest<GridResponse> {
    return new STestRequest<GridResponse>('GET', url, this.ctx);
  }

  expectNotAvailableError(): void {
    this.ctx.harnesses.errors.expect(
      'Weather.gov is not available here. Try another source (in the settings).',
    );
  }
}
