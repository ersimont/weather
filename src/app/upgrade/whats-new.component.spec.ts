import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';

describe('WhatsNewComponent', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('does not show when there is no upgrade', () => {
    ctx.run(() => {
      ctx.cleanUpFreshInit();

      expect(ctx.getHarnessForOptional(WhatsNewComponentHarness)).toBeNull();
    });
  });
});
