import {
  ForecastResponse,
  Timeframe,
} from 'app/sources/weather-unlocked/weather-unlocked';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { expectRequest } from 'app/to-replace/test-context/expect-request';
import { SlTestRequest } from 'app/to-replace/test-context/sl-test-request';
import { createBuilder } from '@s-libs/js-core';

export class WeatherUnlockedHarness {
  constructor(private ctx: WeatherGraphContext) {}

  buildTimeframe = createBuilder<Timeframe>(() => ({
    utcdate: '01/05/2020',
    utctime: 2100,
    temp_c: 12.8,
    feelslike_c: 11.8,
    windspd_kts: 6.0,
    cloudtotal_pct: 6.0,
    precip_mm: 0.0,
    dewpoint_c: 2.5,
  }));
  buildResponse = createBuilder<ForecastResponse, { timeframe: Timeframe }>(
    (_seq, options) => ({
      Days: [{ Timeframes: [options.timeframe || this.buildTimeframe()] }],
    }),
  );

  flushDefault(): void {
    this.expectForecast().flush(this.buildResponse());
  }

  expectForecast(
    gpsCoords = this.ctx.currentLocation,
  ): SlTestRequest<ForecastResponse> {
    const url =
      'https://us-central1-proxic.cloudfunctions.net/api/weather-unlocked/api/forecast/' +
      gpsCoords.join(',');
    return expectRequest('GET', url, { ctx: this.ctx });
  }
}
