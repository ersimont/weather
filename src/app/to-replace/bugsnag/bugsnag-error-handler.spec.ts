import { ErrorHandler } from '@angular/core';
import { AngularContext } from '@s-libs/ng-vitest';
import {
  BugsnagServiceHarness,
  bugSnagTestProviders,
} from 'app/to-replace/bugsnag/bugsnag-service-harness';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';
import { Mock } from 'vitest';

describe('BugsnagErrorHandler', () => {
  let consoleError: Mock;
  let ctx: AngularContext;
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error');
    ctx = new AngularContext({
      providers: [provideBugsnag({ apiKey: '' }), bugSnagTestProviders],
    });
  });

  it('routes errors to console & bugsnag', async () => {
    await ctx.run(async () => {
      const harness = new BugsnagServiceHarness();

      ctx.inject(ErrorHandler).handleError('the error');

      expect(consoleError).toHaveBeenCalledExactlyOnceWith('the error');
      await harness.expectNotify('the error');
    });
  });

  it('converts to notifiable errors', async () => {
    await ctx.run(async () => {
      const harness = new BugsnagServiceHarness();

      ctx.inject(ErrorHandler).handleError(123);

      expect(consoleError).toHaveBeenCalledExactlyOnceWith(123);
      const notifyCalls = await harness.getNotifyCalls();
      expect(notifyCalls.map((c) => c.getArgs())).toEqual([
        [new Error('123', { cause: 123 })],
      ]);
    });
  });
});
