import {
  Address,
  ForwardResponse,
  LocationResponse,
  TimezoneResponse,
} from 'app/misc-services/location-iq.service';
import { GpsCoords } from 'app/state/location';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { STestRequest } from 'app/to-replace/test-context/s-test-request';
import { isEmpty } from '@s-libs/micro-dash';
import { createBuilder } from '@s-libs/js-core';

export class LocationIqServiceHarness {
  buildForwardResponse = createBuilder<ForwardResponse>(() => [
    this.buildLocationResponse(),
  ]);
  buildLocationResponse = createBuilder<LocationResponse, Address>(
    (_seq, options) => ({
      lat: '42.180152',
      lon: '-85.591104',
      address: isEmpty(options)
        ? {
            road: 'Cedarview Drive',
            city: 'Portage',
            state: 'Michigan',
            country_code: 'us',
            state_code: 'mi',
          }
        : options,
    }),
  );
  buildTimezoneResponse = createBuilder<TimezoneResponse>(() => ({
    timezone: { name: 'America/Detroit' },
  }));

  constructor(private ctx: WeatherGraphContext) {}

  flushTimezone(gpsCoords: GpsCoords): void {
    this.expectTimezone(gpsCoords).flush(this.buildTimezoneResponse());
  }

  flushReverse(gpsCoords = this.ctx.currentLocation): void {
    this.expectReverse(gpsCoords).flush(this.buildLocationResponse());
  }

  expectForward(search: string): STestRequest<ForwardResponse> {
    return new STestRequest<ForwardResponse>(
      'GET',
      'https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/search.php',
      this.ctx,
      {
        params: {
          q: search,
          limit: '1',
          format: 'json',
          addressdetails: '1',
          normalizecity: '1',
          statecode: '1',
        },
      },
    );
  }

  expectReverse(
    gpsCoords = this.ctx.currentLocation,
  ): STestRequest<LocationResponse> {
    return new STestRequest<LocationResponse>(
      'GET',
      'https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/reverse.php',
      this.ctx,
      {
        params: {
          lat: gpsCoords[0].toString(),
          lon: gpsCoords[1].toString(),
          format: 'json',
          addressdetails: '1',
          normalizecity: '1',
          statecode: '1',
        },
      },
    );
  }

  expectTimezone(gpsCoords: GpsCoords): STestRequest<TimezoneResponse> {
    return new STestRequest<TimezoneResponse>(
      'GET',
      'https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/timezone.php',
      this.ctx,
      {
        params: { lat: gpsCoords[0].toString(), lon: gpsCoords[1].toString() },
      },
    );
  }
}
