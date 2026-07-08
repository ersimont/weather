import { AngularContext } from '@s-libs/ng-vitest';
import { BugsnagConfig } from 'app/to-replace/bugsnag/bugsnag-config';
import {
  BugsnagServiceHarness,
  bugSnagTestProviders,
} from 'app/to-replace/bugsnag/bugsnag-service-harness';
import { BugsnagService } from 'app/to-replace/bugsnag/bugsnag.service';
import { provideBugsnag } from 'app/to-replace/bugsnag/provide-bugsnag';

describe('BugsnagService', () => {
  function init(config?: Partial<BugsnagConfig>): AngularContext {
    return new AngularContext({
      providers: [
        provideBugsnag({ apiKey: 'testKey', ...config }),
        bugSnagTestProviders,
      ],
    });
  }

  describe('constructor', () => {
    it('adds anonymizers to the config', async () => {
      const ctx = init({ apiKey: 'mykey', releaseStage: 'test' });
      await ctx.run(async () => {
        const harness = new BugsnagServiceHarness();
        await harness.expectStart({
          apiKey: 'mykey',
          releaseStage: 'test',
          collectUserIp: false,
          generateAnonymousId: false,
        });
      });
    });

    it('allow the user to NOT anonymize', async () => {
      const ctx = init({ collectUserIp: true });
      await ctx.run(async () => {
        const harness = new BugsnagServiceHarness();
        await harness.expectStart({
          apiKey: 'testKey',
          collectUserIp: true,
          generateAnonymousId: false,
        });
      });
    });
  });

  describe('.notify()', () => {
    it('sends to bugsnag', async () => {
      const ctx = init();
      await ctx.run(async () => {
        const harness = new BugsnagServiceHarness();
        ctx.inject(BugsnagService).notify('an error');
        await harness.expectNotify('an error');
      });
    });
  });
});
