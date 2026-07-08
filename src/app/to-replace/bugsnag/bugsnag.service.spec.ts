import { AngularContext } from '@s-libs/ng-vitest';
import { BugsnagService } from 'app/to-replace/bugsnag/bugsnag.service';
import {
  BugSnagServiceHarness,
  bugSnagTestProviders,
} from 'app/to-replace/bugsnag/bugsnag.service.harness';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';

describe('BugsnagService', () => {
  describe('.notify()', () => {
    it('sends to bugsnag', async () => {
      const ctx = new AngularContext({
        providers: [provideBugsnag({ apiKey: '' }), bugSnagTestProviders],
      });
      await ctx.run(async () => {
        const bugSnag = new BugSnagServiceHarness();
        ctx.inject(BugsnagService).notify('an error');
        await bugSnag.expectNotify('an error');
      });
    });
  });
});
