import { ComponentHarness } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { AppComponentHarness } from 'app/app.component.harness';

export abstract class AbstractOptionDirectiveHarness extends ComponentHarness {
  private getApp = this.documentRootLocatorFactory().locatorFor(
    AppComponentHarness,
  );
  private getExpansionPanel = this.locatorFor(MatExpansionPanelHarness);

  async ensureExpanded(): Promise<void> {
    await (await this.getApp()).ensureSidenavOpen();
    await this.expand();
  }

  async isExpanded(): Promise<boolean> {
    return (await this.getExpansionPanel()).isExpanded();
  }

  async expand(): Promise<void> {
    await (await this.getExpansionPanel()).expand();
  }

  async collapse(): Promise<void> {
    await (await this.getExpansionPanel()).collapse();
  }
}
