import { MatLegacyDialogHarness as MatDialogHarness } from '@angular/material/legacy-dialog/testing';
import { ManualReinstallComponentHarness } from 'app/misc-components/manual-reinstall/manual-reinstall.component.harness';
import { ManualReinstallServiceHarness } from 'app/misc-components/manual-reinstall/manual-reinstall.service.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('ManualReinstallService', () => {
  let ctx: WeatherGraphContext;
  let manualReinstall: ManualReinstallServiceHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ manualReinstall } = ctx.harnesses);
    manualReinstall.setToTriggerPopup(true);
  });

  async function isPopupShowing(): Promise<boolean> {
    const dialogs = await ctx.getAllHarnesses(MatDialogHarness);
    if (dialogs.length === 0) {
      return false;
    }

    await dialogs[0].getHarness(ManualReinstallComponentHarness);
    return true;
  }

  it('shows the popup when displayed standalone and referred from the github pages URL', () => {
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      expect(await isPopupShowing()).toBe(true);
    });
  });

  it('does not show the popup when the referrer is something other than the github pages URL', () => {
    manualReinstall.setReferrerToTriggerPopup(false);
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      expect(await isPopupShowing()).toBe(false);
    });
  });

  it('does not show the popup when displayed in a browser tab', () => {
    manualReinstall.setDisplayModeToTriggerPopup(false);
    ctx.run(async () => {
      await ctx.cleanUpFreshInit();
      expect(await isPopupShowing()).toBe(false);
    });
  });
});
