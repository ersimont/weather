import { ComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

export class ManualReinstallComponentHarness extends ComponentHarness {
  static hostSelector = 'app-manual-reinstall';

  private getOkButton = this.locatorFor(MatButtonHarness.with({ text: 'OK' }));

  async dismissWithOk(): Promise<void> {
    return (await this.getOkButton()).click();
  }
}
