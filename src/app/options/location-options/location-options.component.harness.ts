import { ComponentHarness } from '@angular/cdk/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { AppComponentHarness } from 'app/app.component.harness';

export class LocationOptionsComponentHarness extends ComponentHarness {
  static hostSelector = 'app-location-options';

  private getApp = this.documentRootLocatorFactory().locatorFor(
    AppComponentHarness,
  );
  private getExpansionPanel = this.locatorFor(MatExpansionPanelHarness);
  private getRadioGroup = this.locatorFor(MatRadioGroupHarness);
  private getInput = this.locatorFor(MatInputHarness);

  async setCustomLocation(search: string) {
    await this.ensureExpanded();
    await (await this.getInput()).setValue(search);
    this.getNativeInput().dispatchEvent(new Event('change'));
  }

  async select(label: 'Current' | 'Custom') {
    await this.ensureExpanded();
    await (await this.getRadioGroup()).checkRadioButton({
      label: label === 'Custom' ? '' : label,
    });
  }

  async isExpanded() {
    return (await this.getExpansionPanel()).isExpanded();
  }

  private async ensureExpanded() {
    await (await this.getApp()).ensureSidenavOpen();
    await (await this.getExpansionPanel()).expand();
  }

  private getNativeInput() {
    return document.querySelector('app-location-options mat-form-field input')!;
  }
}
