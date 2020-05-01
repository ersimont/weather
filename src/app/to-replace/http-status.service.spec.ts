import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import {
  HttpStatusService,
  provideHttpStatus,
} from "app/to-replace/http-status.service";
import { expectSingleCallAndReset } from "s-ng-dev-utils";

describe("HttpStatusService", () => {
  let http: HttpClient;
  let status: HttpStatusService;
  let httpController: HttpTestingController;
  let inFlight: jasmine.Spy;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideHttpStatus()],
    });

    http = TestBed.inject(HttpClient);
    status = TestBed.inject(HttpStatusService);
    httpController = TestBed.inject(HttpTestingController);
    inFlight = jasmine.createSpy();

    status.hasInFlightRequest$.subscribe(inFlight);
    expectSingleCallAndReset(inFlight, false);
  });

  it("tracks in flight requests", () => {
    http.get("url1").subscribe();
    expectSingleCallAndReset(inFlight, true);
    http.get("url2").subscribe();
    http.get("url3").subscribe();

    httpController.expectOne("url1").flush("");
    httpController.expectOne("url3").flush("");
    expect(inFlight).not.toHaveBeenCalled();
    httpController.expectOne("url2").flush("");
    expectSingleCallAndReset(inFlight, false);

    http.get("url4").subscribe();
    expectSingleCallAndReset(inFlight, true);
    httpController.expectOne("url4").flush("");
    expectSingleCallAndReset(inFlight, false);
  });

  // TODO: fails intermittently
  it("handles errors", () => {
    http.get("url1").subscribe();
    expectSingleCallAndReset(inFlight, true);
    httpController.expectOne("url1").flush("", { status: 500, statusText: "" });
    expectSingleCallAndReset(inFlight, false);
  });

  it("handles cancelled requests (with a timeout workaround :( )", fakeAsync(() => {
    const subscription = http.get("url1").subscribe();
    expectSingleCallAndReset(inFlight, true);
    subscription.unsubscribe();
    expect(httpController.expectOne("url1").cancelled).toBe(true);

    tick(10000); // boooo workaround

    expectSingleCallAndReset(inFlight, false);
  }));
});
