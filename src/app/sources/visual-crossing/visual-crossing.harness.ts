import { createBuilder } from '@s-libs/js-core';
import {
  Hour,
  TimelineResponse,
} from 'app/sources/visual-crossing/visual-crossing';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { expectRequest } from 'app/to-replace/test-context/expect-request';
import { SlTestRequest } from 'app/to-replace/test-context/sl-test-request';

export class VisualCrossingHarness {
  constructor(private ctx: WeatherGraphContext) {}

  buildHour = createBuilder<Hour>(() => ({
    datetimeEpoch: 1633233600,
    temp: 19.9,
    feelslike: 19.9,
    dew: 18.4,
    precip: 0.01,
    windspeed: 7.9,
    cloudcover: 100,
  }));
  buildResponse = createBuilder<TimelineResponse, { hour: Hour }>(
    (_seq, options) => ({
      days: [{ hours: [options.hour || this.buildHour()] }],
    }),
  );

  flushDefault(): void {
    this.expectForecast().flush(this.buildResponse());
  }

  expectForecast(
    gpsCoords = this.ctx.currentLocation,
  ): SlTestRequest<TimelineResponse> {
    const url =
      'https://us-central1-proxic.cloudfunctions.net/api/visual-crossing/VisualCrossingWebServices/rest/services/timeline/' +
      gpsCoords.join(',');
    return expectRequest('GET', url, {
      params: { unitGroup: 'metric', include: 'hours' },
      ctx: this.ctx,
    });
  }
}
