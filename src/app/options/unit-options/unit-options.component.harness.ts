import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { AbstractOptionDirectiveHarness } from 'app/options/abstract-option-directive/abstract-option.directive.harness';

export class UnitOptionsComponentHarness extends AbstractOptionDirectiveHarness {
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
