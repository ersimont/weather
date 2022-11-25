import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { AbstractOptionDirectiveHarness } from 'app/options/abstract-option-directive/abstract-option.directive.harness';

export class SourceOptionsComponentHarness extends AbstractOptionDirectiveHarness {
  static hostSelector = 'app-source-options';

  async toggle(label: string): Promise<void> {
    await this.ensureExpanded();
    await (await this.getToggle(label)).toggle();
  }

  private getToggle(label: string): Promise<MatSlideToggleHarness> {
    const locator = this.locatorFor(MatSlideToggleHarness.with({ label }));
    return locator();
  }
}
