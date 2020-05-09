import { OverlayContainer } from '@angular/cdk/overlay';
import { ErrorHandler } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import {
  PresentableError,
  provideErrorHandler,
} from 'app/to-replace/snack-bar-error.service';
import { AngularContext } from 'app/to-replace/test-context/angular-context';

class Context extends AngularContext<{}> {
  static setUp() {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          EventTrackingModule.forRoot(),
          MatSnackBarModule,
          NoopAnimationsModule,
        ],
        providers: [provideErrorHandler()],
      });
    });

    afterEach(() => {
      TestBed.inject(OverlayContainer).ngOnDestroy();
    });
  }
}

describe('SnackBarErrorService', () => {
  Context.setUp();

  let ctx: Context;
  let errorHandler: ErrorHandler;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    ctx = new Context();
    errorHandler = ctx.inject(ErrorHandler);
    events = new EventTrackingServiceHarness({});
  });

  function generateUncaughtPromiseError(error: any) {
    try {
      fakeAsync(() => Promise.reject(error))();
      fail('should not get here');
    } catch (error) {
      return error;
    }
  }

  describe('.handleError()', () => {
    describe('with a PresentableError', () => {
      it('does not track an event', () => {
        errorHandler.handleError(new PresentableError('nope'));
        expect(events.getErrors()).toEqual([]);
      });
    });

    describe("with an 'unhandled rejection' PresentableError", () => {
      it('does not track an event', () => {
        errorHandler.handleError(
          generateUncaughtPromiseError(new PresentableError('still no')),
        );
        expect(events.getErrors()).toEqual([]);
      });
    });

    describe('with an Error object that is not presentable', () => {
      it('tracks an event', () => {
        errorHandler.handleError(new Error('present'));
        expect(events.getErrors()).toEqual(['present']);
      });
    });

    describe("with an 'unhandled rejection' that is not presentable", () => {
      it('tracks an event', () => {
        errorHandler.handleError(generateUncaughtPromiseError('track me'));
        expect(events.getErrors()).toEqual(['track me']);
      });
    });

    describe('with a string', () => {
      it('tracks an event', () => {
        errorHandler.handleError("I'm a string");
        expect(events.getErrors()).toEqual(["I'm a string"]);
      });
    });
  });
});
