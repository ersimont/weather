import { createBuilder } from '@s-libs/js-core';
import {
  IntervalValues,
  TimelinesResponse,
} from 'app/sources/tomorrow-io/tomorrow-io';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { expectRequest } from 'app/to-replace/test-context/expect-request';
import { SlTestRequest } from 'app/to-replace/test-context/sl-test-request';

export class TomorrowIoHarness {
  constructor(private ctx: WeatherGraphContext) {}

  buildTimelinesResponse = createBuilder<TimelinesResponse, IntervalValues>(
    (_, options) => ({
      data: {
        timelines: [
          {
            intervals: [
              {
                startTime: new Date().toISOString(),
                values: {
                  cloudCover: 0,
                  dewPoint: 0,
                  precipitationIntensity: 0,
                  temperature: 0,
                  temperatureApparent: 0,
                  windSpeed: 0,
                  ...options,
                },
              },
            ],
          },
        ],
      },
    }),
  );

  flushDefault(gpsCoords = this.ctx.currentLocation): void {
    this.expectTimelines(gpsCoords).flush(this.buildTimelinesResponse());
  }

  expectTimelines(
    gpsCoords = this.ctx.currentLocation,
  ): SlTestRequest<TimelinesResponse> {
    const url =
      'https://us-central1-proxic.cloudfunctions.net/api/tomorrow-io/v4/timelines';
    const params = {
      location: gpsCoords.join(),
      timesteps: '1h',
      fields:
        'cloudCover,dewPoint,precipitationIntensity,temperature,temperatureApparent,windSpeed',
    };
    return expectRequest<TimelinesResponse>('GET', url, {
      params,
      ctx: this.ctx,
    });
  }
}
