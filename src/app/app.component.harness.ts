import { ContentContainerComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatActionListItemHarness } from '@angular/material/list/testing';
import { MatSidenavHarness } from '@angular/material/sidenav/testing';
import { MatToolbarHarness } from '@angular/material/toolbar/testing';

export class AppComponentHarness extends ContentContainerComponentHarness {
  static hostSelector = 'app-root';

  defaultTitle = 'Weather Graph';

  private getMenuButton = this.locatorFor(
    MatButtonHarness.with({ text: 'menu' }),
  );
  private getAboutItem = this.locatorFor(
    MatActionListItemHarness.with({ text: 'About' }),
  );
  private getPrivacyPolicyItem = this.locatorFor(
    MatActionListItemHarness.with({ text: 'Privacy Policy' }),
  );
  private getSidenav = this.locatorFor(MatSidenavHarness);

  async openAbout(): Promise<void> {
    await this.ensureSidenavOpen();
    await (await this.getAboutItem()).click();
  }

  async snapToRange(range: 'day' | 'three-days' | 'week'): Promise<void> {
    (await this.getRangeButton(range)).click();
  }

  async openPrivacyPolicy(): Promise<void> {
    await this.ensureSidenavOpen();
    await (await this.getPrivacyPolicyItem()).click();
  }

  async ensureSidenavOpen(): Promise<void> {
    if (!(await this.isSidenavOpen())) {
      await (await this.getMenuButton()).click();
    }
  }

  async isSidenavOpen(): Promise<boolean> {
    return (await this.getSidenav()).isOpen();
  }

  async getHeaderWidth(): Promise<string> {
    const toolbar = await this.getHarness(MatToolbarHarness);
    return (await toolbar.host()).getCssValue('width');
  }

  async getTitle(): Promise<any> {
    const loader = await this.locatorFor('h1');
    return (await loader()).text();
  }

  private async getRangeButton(className: string): Promise<MatButtonHarness> {
    const buttons = await this.locatorForAll(MatButtonHarness)();
    for (const button of buttons) {
      const bh = await button.host();
      if (await bh.hasClass(className)) {
        return button;
      }
    }
    throw new Error(`No button found with class ${className}`);
  }
}
