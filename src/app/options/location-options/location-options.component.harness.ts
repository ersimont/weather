import { MatInputHarness } from '@angular/material/input/testing';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { assert } from '@s-libs/js-core';
import { AngularContext } from '@s-libs/ng-dev';
import { AbstractOptionDirectiveHarness } from 'app/options/abstract-option-directive/abstract-option.directive.harness';

export class LocationOptionsComponentHarness extends AbstractOptionDirectiveHarness {
  static hostSelector = 'app-location-options';

  private getRadioGroup = this.locatorFor(MatRadioGroupHarness);
  private getInput = this.locatorFor(MatInputHarness);

  async setCustomLocation(search: string): Promise<void> {
    await this.ensureExpanded();
    const input = await this.getInput();
    await input.setValue(search);
    this.getNativeInput().dispatchEvent(new Event('change', { bubbles: true }));
    AngularContext.getCurrent()!.tick();
  }

  async select(label: 'Current' | 'Custom'): Promise<void> {
    await this.ensureExpanded();
    const radioGroup = await this.getRadioGroup();
    await radioGroup.checkRadioButton({
      label: label === 'Custom' ? '' : label,
    });
  }

  async getSelected(): Promise<'Current' | 'Custom'> {
    const checked = await (await this.getRadioGroup()).getCheckedRadioButton();
    assert(checked, 'No location option selected');
    const text = (await checked.getLabelText()) as 'Current' | '';
    return text || 'Custom';
  }

  private getNativeInput(): Element {
    return document.querySelector('app-location-options mat-form-field input')!;
  }
}
