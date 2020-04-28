import {
  ForwardResponse,
  LocationResponse,
} from "app/services/location-iq.service";
import { STestRequest } from "app/test-helpers/s-test-request";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

export class LocationIqServiceHarness {
  forwardHarness: ForwardResponse = [
    {
      lat: "45.4972159",
      lon: "-73.6103642",
      address: {
        city: "Montreal",
        state: "Quebec",
        country_code: "ca",
        state_code: "qc",
      },
    },
  ];

  reverseHarness: LocationResponse = {
    lat: "42.180152",
    lon: "-85.591104",
    address: {
      road: "Cedarview Drive",
      city: "Portage",
      state: "Michigan",
      country_code: "us",
      state_code: "mi",
    },
  };

  constructor(private ctx: WeatherGraphContext) {}

  flushForward(search: string) {
    return this.expectForward(search).flush(this.forwardHarness);
  }

  flushReverse() {
    this.expectReverse().flush(this.reverseHarness);
  }

  expectForward(search: string) {
    return new STestRequest(
      "GET",
      "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/search.php",
      this.ctx,
      {
        params: {
          q: search,
          limit: "1",
          format: "json",
          addressdetails: "1",
          normalizecity: "1",
          statecode: "1",
        },
      },
    );
  }

  expectReverse(gpsCoords = this.ctx.currentLocation) {
    return new STestRequest(
      "GET",
      "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/reverse.php",
      this.ctx,
      {
        params: {
          lat: gpsCoords[0].toString(),
          lon: gpsCoords[1].toString(),
          format: "json",
          addressdetails: "1",
          normalizecity: "1",
          statecode: "1",
        },
      },
    );
  }
}
