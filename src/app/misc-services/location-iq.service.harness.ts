import { createBuilder } from '@s-libs/js-core';
import { isEmpty } from '@s-libs/micro-dash';
import { expectRequest, SlTestRequest } from '@s-libs/ng-vitest';
import {
  Address,
  ForwardResponse,
  LocationResponse,
  TimezoneResponse,
} from 'app/misc-services/location-iq.service';
import { GpsCoords } from 'app/state/location';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class LocationIqServiceHarness {
  buildForwardResponse = createBuilder<ForwardResponse>(() => [
    this.buildLocationResponse(),
  ]);
  buildLocationResponse = createBuilder<LocationResponse, Address>(
    (_seq, options) => {
      if (isEmpty(options)) {
        options = {
          road: 'Cedarview Drive',
          city: 'Portage',
          state: 'Michigan',
          country_code: 'us',
          state_code: 'mi',
        };
      }
      return { lat: '42.180152', lon: '-85.591104', address: options };
    },
  );
  buildTimezoneResponse = createBuilder<TimezoneResponse>(() => ({
    timezone: { name: 'America/Detroit' },
  }));

  constructor(private ctx: WeatherGraphContext) {}

  async flushTimezone(gpsCoords: GpsCoords): Promise<void> {
    await this.expectTimezone(gpsCoords).flush(this.buildTimezoneResponse());
  }

  async flushReverse(gpsCoords = this.ctx.currentLocation): Promise<void> {
    await this.expectReverse(gpsCoords).flush(this.buildLocationResponse());
  }

  expectForward(search: string): SlTestRequest<ForwardResponse> {
    return expectRequest<ForwardResponse>(
      'GET',
      '/api/location-iq/v1/search.php',
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
  ): SlTestRequest<LocationResponse> {
    return expectRequest<LocationResponse>(
      'GET',
      '/api/location-iq/v1/reverse.php',
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

  expectTimezone(gpsCoords: GpsCoords): SlTestRequest<TimezoneResponse> {
    return expectRequest<TimezoneResponse>(
      'GET',
      '/api/location-iq/v1/timezone.php',
      {
        params: { lat: gpsCoords[0].toString(), lon: gpsCoords[1].toString() },
      },
    );
  }
}
