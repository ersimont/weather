import { HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

export function expectLocationIqReverse() {
  return expectOne(
    "https://us-central1-proxic.cloudfunctions.net/api/location-iq/v1/reverse.php",
  );
}

function expectOne(url: string) {
  const controller: HttpTestingController = TestBed.get(HttpTestingController);
  return controller.expectOne((req) => {
    return req.url === url;
  });
}
