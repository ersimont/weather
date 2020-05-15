import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { AbstractOptionPanelHarness } from 'app/test-helpers/abstract-option-panel-harness';

export class UnitOptionsComponentHarness extends AbstractOptionPanelHarness {
  static hostSelector = 'app-unit-options';

  async select(unitLabel: string) {
    await this.ensureExpanded();
    await (await this.getButton(unitLabel)).check();
  }

  private getButton(text: string) {
    const locator = this.locatorFor(MatButtonToggleHarness.with({ text }));
    return locator();
  }
}
