import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { STestRequest } from 'app/to-replace/test-context/s-test-request';
import { createBuilder } from '@s-libs/js-core';
import { ForecastResponse, Timeframe } from './open-weather';

export class OpenWeatherHarness {
  constructor(private ctx: WeatherGraphContext) {}

  buildTimeframe = createBuilder<Timeframe>(() => ({
    clouds: { all: 0 },
    dt: Date.now(),
    main: { feels_like: 0, humidity: 0, temp: 0 },
    wind: { speed: 0 },
  }));
  buildForecastResponse = createBuilder<ForecastResponse>(() => ({
    list: [this.buildTimeframe()],
  }));

  flushDefault(gpsCoords = this.ctx.currentLocation): void {
    this.expectForecast(gpsCoords).flush(this.buildForecastResponse());
  }

  expectForecast(
    gpsCoords = this.ctx.currentLocation,
  ): STestRequest<ForecastResponse> {
    const url =
      'https://us-central1-proxic.cloudfunctions.net/api/openweathermap/data/2.5/forecast';
    const params = {
      lat: gpsCoords[0].toString(),
      lon: gpsCoords[1].toString(),
      units: 'metric',
    };
    return new STestRequest<ForecastResponse>('GET', url, this.ctx, { params });
  }
}
