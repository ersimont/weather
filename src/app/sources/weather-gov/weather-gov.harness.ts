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
import { expectRequest } from 'app/to-replace/test-context/expect-request';
import { SlTestRequest } from 'app/to-replace/test-context/sl-test-request';

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
  ): SlTestRequest<PointResponse> {
    return expectRequest<PointResponse>(
      'GET',
      `https://api.weather.gov/points/${gpsCoordinates.join(',')}`,
      { ctx: this.ctx },
    );
  }

  expectGrid(
    url = pointResponse.properties.forecastGridData,
  ): SlTestRequest<GridResponse> {
    return expectRequest<GridResponse>('GET', url, { ctx: this.ctx });
  }

  expectNotAvailableError(): void {
    this.ctx.harnesses.errors.expect(
      'Weather.gov is not available here. Try another source (in the settings).',
    );
  }
}
