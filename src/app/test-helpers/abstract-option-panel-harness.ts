import { ComponentHarness } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { AppComponentHarness } from 'app/app.component.harness';

export abstract class AbstractOptionPanelHarness extends ComponentHarness {
  private getApp = this.documentRootLocatorFactory().locatorFor(
    AppComponentHarness,
  );
  private getExpansionPanel = this.locatorFor(MatExpansionPanelHarness);

  async isExpanded() {
    return (await this.getExpansionPanel()).isExpanded();
  }

  protected async ensureExpanded() {
    await (await this.getApp()).ensureSidenavOpen();
    await (await this.getExpansionPanel()).expand();
  }
}
