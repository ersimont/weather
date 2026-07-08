import { ErrorHandler } from '@angular/core';
import { AngularContext } from '@s-libs/ng-vitest';
import {
  BugSnagServiceHarness,
  bugSnagTestProviders,
} from 'app/to-replace/bugsnag/bugsnag.service.harness';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';

describe('BugsnagErrorHandler', () => {
  it('routes errors to bugsnag', async () => {
    const ctx = new AngularContext({
      providers: [provideBugsnag({ apiKey: '' }), bugSnagTestProviders],
    });
    await ctx.run(async () => {
      const bugSnag = new BugSnagServiceHarness();
      ctx.inject(ErrorHandler).handleError('the error');
      await bugSnag.expectNotify('the error');
    });
  });
});
