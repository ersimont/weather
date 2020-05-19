import { ComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatActionListItemHarness } from '@angular/material/list/testing';
import { MatSidenavHarness } from '@angular/material/sidenav/testing';

export class AppComponentHarness extends ComponentHarness {
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

  async openAbout() {
    await this.ensureSidenavOpen();
    await (await this.getAboutItem()).click();
  }

  async openPrivacyPolicy() {
    await this.ensureSidenavOpen();
    await (await this.getPrivacyPolicyItem()).click();
  }

  async ensureSidenavOpen() {
    if (!(await this.isSidenavOpen())) {
      await (await this.getMenuButton()).click();
    }
  }

  async isSidenavOpen() {
    return (await this.getSidenav()).isOpen();
  }

  async getTitle() {
    const loader = await this.locatorFor('h1');
    return (await loader()).text();
  }
}
