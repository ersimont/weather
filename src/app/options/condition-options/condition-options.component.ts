import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { Condition, conditionInfo } from 'app/state/condition';
import { values } from 'micro-dash';

@Component({
  selector: 'app-condition-options',
  templateUrl: './condition-options.component.html',
  styleUrls: ['./condition-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionOptionsComponent extends AbstractOptionDirective {
  conditions = values(Condition);
  conditionInfo: any = conditionInfo;

  protected optionType = 'condition';
}
