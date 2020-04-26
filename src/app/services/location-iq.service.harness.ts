import { ReverseResponse } from "app/services/location-iq.service";
import { STestRequest } from "app/test-helpers/s-test-request";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

export class LocationIqServiceHarness {
  reverseHarness: ReverseResponse = {
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

  flushReverse() {
    this.expectReverse().flush(this.reverseHarness);
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
