import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { AbstractOptionPanelHarness } from 'app/test-helpers/abstract-option-panel-harness';

export class SourceOptionsComponentHarness extends AbstractOptionPanelHarness {
  static hostSelector = 'app-source-options';

  async toggle(label: string) {
    await this.ensureExpanded();
    await (await this.getToggle(label)).toggle();
  }

  private getToggle(label: string) {
    const locator = this.locatorFor(MatSlideToggleHarness.with({ label }));
    return locator();
  }
}
