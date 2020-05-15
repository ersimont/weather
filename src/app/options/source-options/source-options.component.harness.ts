import { ComponentHarness } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { AppComponentHarness } from 'app/app.component.harness';

export class SourceOptionsComponentHarness extends ComponentHarness {
  static hostSelector = 'app-source-options';

  private getApp = this.documentRootLocatorFactory().locatorFor(
    AppComponentHarness,
  );
  private getExpansionPanel = this.locatorFor(MatExpansionPanelHarness);

  async toggle(label: string) {
    await this.ensureExpanded();
    await (await this.getToggle(label)).toggle();
  }

  private async ensureExpanded() {
    await (await this.getApp()).ensureSidenavOpen();
    await (await this.getExpansionPanel()).expand();
  }

  private getToggle(label: string) {
    const locator = this.locatorFor(MatSlideToggleHarness.with({ label }));
    return locator();
  }
}
