import { MatInputHarness } from '@angular/material/input/testing';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { AbstractOptionDirectiveHarness } from 'app/options/abstract-option-directive/abstract-option.directive.harness';

export class LocationOptionsComponentHarness extends AbstractOptionDirectiveHarness {
  static hostSelector = 'app-location-options';

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

  private getNativeInput() {
    return document.querySelector('app-location-options mat-form-field input')!;
  }
}
