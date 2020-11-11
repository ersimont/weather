import { OverlayContainer } from '@angular/cdk/overlay';
import { ErrorHandler } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import {
  PresentableError,
  provideErrorHandler,
  SnackBarErrorService,
} from 'app/to-replace/snack-bar-error.service';
import { AngularContext } from 'app/to-replace/test-context/angular-context';

class Context extends AngularContext {
  constructor() {
    super({
      imports: [
        EventTrackingModule.forRoot(),
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [provideErrorHandler()],
    });
  }

  protected cleanUp(): void {
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(5000);
    super.cleanUp();
  }
}

describe('SnackBarErrorService', () => {
  let ctx: Context;
  let errorHandler: ErrorHandler;
  let service: SnackBarErrorService;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    ctx = new Context();
    errorHandler = ctx.inject(ErrorHandler);
    service = ctx.inject(SnackBarErrorService);
    events = new EventTrackingServiceHarness({});
  });

  function generateUncaughtPromiseError(error: any): Error {
    try {
      fakeAsync(() => Promise.reject(error))();
      throw new Error('should not get here');
    } catch (error) {
      return error;
    }
  }

  describe('.handleError()', () => {
    describe('with a PresentableError', () => {
      it('does not track an event', () => {
        ctx.run(() => {
          errorHandler.handleError(new PresentableError('nope'));
          expect(events.getErrors()).toEqual([]);
        });
      });
    });

    describe("with an 'unhandled rejection' PresentableError", () => {
      it('does not track an event', () => {
        const error = generateUncaughtPromiseError(
          new PresentableError('still no'),
        );
        ctx.run(() => {
          errorHandler.handleError(error);
          expect(events.getErrors()).toEqual([]);
        });
      });
    });

    describe('with an Error object that is not presentable', () => {
      it('tracks an event', () => {
        ctx.run(() => {
          errorHandler.handleError(new Error('present'));
          expect(events.getErrors()).toEqual(['present']);
        });
      });
    });

    describe("with an 'unhandled rejection' that is not presentable", () => {
      it('tracks an event', () => {
        const error = generateUncaughtPromiseError('track me');
        ctx.run(() => {
          errorHandler.handleError(error);
          expect(events.getErrors()).toEqual(['track me']);
        });
      });
    });

    describe('with a string', () => {
      it('tracks an event', () => {
        ctx.run(() => {
          errorHandler.handleError("I'm a string");
          expect(events.getErrors()).toEqual(["I'm a string"]);
        });
      });
    });
  });

  describe('.show()', () => {
    it('displays a snack bar for 5 seconds', () => {
      ctx.run(() => {
        service.show('hi');
        expect(ctx.getHarnessOptional(MatSnackBarHarness)).not.toBeNull();
        ctx.tick(4999);
        expect(ctx.getHarnessOptional(MatSnackBarHarness)).not.toBeNull();
        ctx.tick(1);
        expect(ctx.getHarnessOptional(MatSnackBarHarness)).toBeNull();
      });
    });

    it('shows the message', () => {
      ctx.run(() => {
        service.show('hi');
        expect(ctx.getHarness(MatSnackBarHarness).getMessage()).toBe('hi');
      });
    });

    it('is dismissible with "OK"', () => {
      ctx.run(() => {
        service.show('hi');
        const snackBar = ctx.getHarness(MatSnackBarHarness);
        expect(snackBar.getActionDescription()).toBe('OK');
        snackBar.dismissWithAction();
        expect(ctx.getHarnessOptional(MatSnackBarHarness)).toBeNull();
      });
    });
  });
});
