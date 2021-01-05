import { MatDialogHarness } from '@angular/material/dialog/testing';
import { ManualReinstallComponentHarness } from 'app/misc-components/manual-reinstall/manual-reinstall.component.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('ManualReinstallComponent', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ctx.harnesses.manualReinstall.setToTriggerPopup(true);
  });

  it('can be dismissed with an OK button', () => {
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      const component = await ctx.getHarness(ManualReinstallComponentHarness);

      await component.dismissWithOk();

      expect(await ctx.getAllHarnesses(MatDialogHarness)).toEqual([]);

      ctx.tick(500); // material queued up some tasks to animate the dialog away
    });
  });
});
