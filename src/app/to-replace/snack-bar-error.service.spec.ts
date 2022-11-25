import { OverlayContainer } from '@angular/cdk/overlay';
import { ErrorHandler } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AngularContext } from '@s-libs/ng-dev';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import {
  provideErrorHandler,
  SnackBarErrorService,
} from 'app/to-replace/snack-bar-error.service';

class TestContext extends AngularContext {
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

  protected override cleanUp(): void {
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(5000);
    super.cleanUp();
  }
}

describe('SnackBarErrorService', () => {
  let ctx: TestContext;
  let errorHandler: ErrorHandler;
  let service: SnackBarErrorService;
  let events: EventTrackingServiceHarness;
  beforeEach(() => {
    ctx = new TestContext();
    errorHandler = ctx.inject(ErrorHandler);
    service = ctx.inject(SnackBarErrorService);
    events = new EventTrackingServiceHarness({});
  });

  function generateUncaughtPromiseError(error: any): Error {
    try {
      fakeAsync(() => Promise.reject(error))();
      throw new Error('should not get here');
    } catch (error) {
      return error as Error;
    }
  }

  // Disabling these tests after the switch to bugsnag. They should be changed to show we're logging to bugsnag at the right times.
  xdescribe('.handleError()', () => {
    describe('with an Error object', () => {
      it('tracks an event', () => {
        ctx.run(() => {
          errorHandler.handleError(new Error('present'));
          expect(events.getErrors()).toEqual(['present']);
        });
      });
    });

    describe("with an 'unhandled rejection'", () => {
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
      ctx.run(async () => {
        service.show('hi');
        expect((await ctx.getAllHarnesses(MatSnackBarHarness)).length).toBe(1);
        ctx.tick(4999);
        expect((await ctx.getAllHarnesses(MatSnackBarHarness)).length).toBe(1);
        ctx.tick(1);
        expect((await ctx.getAllHarnesses(MatSnackBarHarness)).length).toBe(0);
      });
    });

    it('shows the message', () => {
      ctx.run(async () => {
        service.show('hi');
        const snackbar = await ctx.getHarness(MatSnackBarHarness);
        expect(await snackbar.getMessage()).toBe('hi');
      });
    });

    it('is dismissible with "OK"', () => {
      ctx.run(async () => {
        service.show('hi');
        const snackBar = await ctx.getHarness(MatSnackBarHarness);
        expect(await snackBar.getActionDescription()).toBe('OK');
        await snackBar.dismissWithAction();
        expect((await ctx.getAllHarnesses(MatSnackBarHarness)).length).toBe(0);
      });
    });
  });
});
