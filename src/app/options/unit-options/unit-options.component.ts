import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { AmountUnit, SpeedUnit, TempUnit } from 'app/state/units';
import { values } from 'micro-dash';

@Component({
  selector: 'app-unit-options',
  templateUrl: './unit-options.component.html',
  styleUrls: ['./unit-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitOptionsComponent extends AbstractOptionDirective {
  unitOptions = [
    { type: 'temp', options: values(TempUnit) },
    { type: 'amount', options: values(AmountUnit) },
    { type: 'speed', options: values(SpeedUnit) },
  ];

  protected optionType = 'unit';
}
