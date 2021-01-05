import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';

describe('WhatsNewComponent', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('does not show when there is no upgrade', () => {
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();

      expect(await ctx.getAllHarnesses(WhatsNewComponentHarness)).toEqual([]);
    });
  });
});
