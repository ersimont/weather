import { createBuilder } from '@s-libs/js-core';
import { expectRequest, SlTestRequest } from '@s-libs/ng-vitest';
import { ForecastResponse } from 'app/sources/open-mateo/open-mateo';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class OpenMateoHarness {
  buildForecastResponse = createBuilder<ForecastResponse>(() => ({
    hourly: {
      time: [Date.now()],
      temperature_2m: [0],
      dew_point_2m: [0],
      apparent_temperature: [0],
      precipitation: [0],
      wind_speed_10m: [0],
      cloud_cover: [0],
    },
  }));

  constructor(private ctx: WeatherGraphContext) {}

  async flushDefault(gpsCoords = this.ctx.currentLocation): Promise<void> {
    await this.expectForecast(gpsCoords).flush(this.buildForecastResponse());
  }

  expectForecast(
    gpsCoords = this.ctx.currentLocation,
  ): SlTestRequest<ForecastResponse> {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: gpsCoords[0].toString(),
      longitude: gpsCoords[1].toString(),
      hourly:
        'temperature_2m,dew_point_2m,apparent_temperature,precipitation,wind_speed_10m,cloud_cover',
      past_days: '1',
      forecast_days: '9',
      timeformat: 'unixtime',
      wind_speed_unit: 'kn',
    };
    return expectRequest<ForecastResponse>('GET', url, { params });
  }
}
