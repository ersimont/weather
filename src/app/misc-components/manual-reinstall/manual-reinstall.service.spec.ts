import { MatDialogHarness } from '@angular/material/dialog/testing';
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

  function findPopup(): void {
    const dialog = ctx.getHarness(MatDialogHarness);
    dialog.getHarness(ManualReinstallComponentHarness);
  }

  it('shows the popup when displayed standalone and referred from the github pages URL', () => {
    ctx.run(() => {
      ctx.cleanUpFreshInit();
      expect(findPopup).not.toThrowError();
    });
  });

  it('does not show the popup when the referrer is something other than the github pages URL', () => {
    manualReinstall.setReferrerToTriggerPopup(false);
    ctx.run(() => {
      ctx.cleanUpFreshInit();
      expect(findPopup).toThrowError();
    });
  });

  it('does not show the popup when displayed in a browser tab', () => {
    manualReinstall.setDisplayModeToTriggerPopup(false);
    ctx.run(() => {
      ctx.cleanUpFreshInit();
      expect(findPopup).toThrowError();
    });
  });
});
