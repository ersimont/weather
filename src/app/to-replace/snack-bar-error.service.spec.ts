import { OverlayContainer } from '@angular/cdk/overlay';
import { ErrorHandler } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { FakeAsyncHarnessEnvironment } from 'app/to-replace/fake-async-harnesses/fake-async-harness-environment';
import { Synchronized } from 'app/to-replace/fake-async-harnesses/synchronize';
import {
  PresentableError,
  provideErrorHandler,
  SnackBarErrorService,
} from 'app/to-replace/snack-bar-error.service';
import { ComponentContext } from 'app/to-replace/test-context/component-context';
import { DummyComponent } from 'app/to-replace/test-context/dummy.component';

class Context extends ComponentContext<DummyComponent, {}> {
  protected componentType = DummyComponent;

  constructor() {
    super({
      imports: [
        EventTrackingModule.forRoot(),
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [provideErrorHandler()],
      declarations: [DummyComponent],
    });
  }

  protected cleanUp() {
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
    let loader: Synchronized<FakeAsyncHarnessEnvironment>;
    beforeEach(() => {
      loader = FakeAsyncHarnessEnvironment.documentRootLoader(ctx);
    });

    function getSnackBar() {
      return loader.getHarness(MatSnackBarHarness) as Synchronized<
        MatSnackBarHarness
      >;
    }

    function getSnackBarCount() {
      return loader.getAllHarnesses(MatSnackBarHarness).length;
    }

    it('displays a snack bar for 5 seconds', () => {
      // TODO: try applicationRef.tick() instead of using a dummy component
      ctx.run(() => {
        service.show('hi');
        expect(getSnackBarCount()).toBe(1);
        ctx.tick(4999);
        expect(getSnackBarCount()).toBe(1);
        ctx.tick(1);
        expect(getSnackBarCount()).toBe(0);
      });
    });

    it('shows the message', () => {
      ctx.run(() => {
        service.show('hi');
        const snackBar = getSnackBar();
        expect(snackBar.getMessage()).toBe('hi');
      });
    });

    it('is dismissable with "OK"', () => {
      ctx.run(() => {
        service.show('hi');
        const snackBar = getSnackBar();
        expect(snackBar.getActionDescription()).toBe('OK');
        snackBar.dismissWithAction();
        expect(getSnackBarCount()).toBe(0);
      });
    });
  });
});
