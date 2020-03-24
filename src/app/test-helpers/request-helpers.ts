import { HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { GpsCoords } from "app/state/location";

export function expectLocationIqReverse() {
  return expectOne(
    "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/reverse.php",
  );
}

export function expectWeatherGovPoints(gpsCoordinates: GpsCoords) {
  return expectOne(
    `https://api.weather.gov/points/${gpsCoordinates.join(",")}`,
  );
}

function expectOne(url: string) {
  const controller: HttpTestingController = TestBed.inject(
    HttpTestingController,
  );
  return controller.expectOne((req) => {
    return req.url === url;
  });
}
