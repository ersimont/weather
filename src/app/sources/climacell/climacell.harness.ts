import { createBuilder } from '@s-libs/js-core';
import { HourlyResponse, Timeframe } from 'app/sources/climacell/climacell';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { expectRequest } from 'app/to-replace/test-context/expect-request';
import { SlTestRequest } from 'app/to-replace/test-context/sl-test-request';

export class ClimacellHarness {
  constructor(private ctx: WeatherGraphContext) {}

  buildTimeframe = createBuilder<Timeframe>(() => ({
    observation_time: { value: new Date().toISOString() },
    cloud_cover: { value: 0 },
    dewpoint: { value: 0 },
    feels_like: { value: 0 },
    precipitation: { value: 0 },
    temp: { value: 0 },
    wind_speed: { value: 0 },
  }));
  buildHourlyResponse = createBuilder<HourlyResponse>(() => [
    this.buildTimeframe(),
  ]);

  flushDefault(gpsCoords = this.ctx.currentLocation): void {
    this.expectHourly(gpsCoords).flush(this.buildHourlyResponse());
  }

  expectHourly(
    gpsCoords = this.ctx.currentLocation,
  ): SlTestRequest<HourlyResponse> {
    const url =
      'https://us-central1-proxic.cloudfunctions.net/api/climacell/v3/weather/forecast/hourly';
    const params = {
      lat: gpsCoords[0].toString(),
      lon: gpsCoords[1].toString(),
      fields:
        'cloud_cover,dewpoint,feels_like,precipitation,temp,wind_speed:knots',
    };
    return expectRequest<HourlyResponse>('GET', url, { params, ctx: this.ctx });
  }
}
