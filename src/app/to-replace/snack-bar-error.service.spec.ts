import { OverlayContainer } from "@angular/cdk/overlay";
import { ErrorHandler } from "@angular/core";
import { fakeAsync, TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { EventTrackingModule } from "app/to-replace/event-tracking/event-tracking.module";
import { EventTrackingServiceHarness } from "app/to-replace/event-tracking/event-tracking.service.harness";
import {
  PresentableError,
  provideErrorHandler,
} from "app/to-replace/snack-bar-error.service";

describe("SnackBarErrorService", () => {
  let errorHandler: ErrorHandler;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        EventTrackingModule.forRoot(),
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [provideErrorHandler()],
    });
    errorHandler = TestBed.inject(ErrorHandler);
    events = new EventTrackingServiceHarness();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  function generateUncaughtPromiseError(error: any) {
    try {
      fakeAsync(() => Promise.reject(error))();
      fail("should not get here");
    } catch (error) {
      return error;
    }
  }

  describe("with a PresentableError", () => {
    it("does not track an event", () => {
      errorHandler.handleError(new PresentableError("nope"));
      expect(events.getErrorDescriptions()).toEqual([]);
    });
  });

  describe("with an 'unhandled rejection' PresentableError", () => {
    it("does not track an event", () => {
      errorHandler.handleError(
        generateUncaughtPromiseError(new PresentableError("still no")),
      );
      expect(events.getErrorDescriptions()).toEqual([]);
    });
  });

  describe("with an Error object that is not presentable", () => {
    it("tracks an event", () => {
      errorHandler.handleError(new Error("present"));
      expect(events.getErrorDescriptions()).toEqual(["present"]);
    });
  });

  describe("with an 'unhandled rejection' that is not presentable", () => {
    it("tracks an event", () => {
      errorHandler.handleError(generateUncaughtPromiseError("track me"));
      expect(events.getErrorDescriptions()).toEqual(["track me"]);
    });
  });

  describe("with a string", () => {
    it("tracks an event", () => {
      errorHandler.handleError("I'm a string");
      expect(events.getErrorDescriptions()).toEqual(["I'm a string"]);
    });
  });
});
