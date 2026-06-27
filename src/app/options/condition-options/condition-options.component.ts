import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { values } from '@s-libs/micro-dash';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { Condition, conditionInfo } from 'app/state/condition';

@Component({
  selector: 'app-condition-options',
  imports: [FormsModule, MatExpansionModule, MatSlideToggleModule],
  templateUrl: './condition-options.component.html',
  styleUrl: './condition-options.component.css',
})
export class ConditionOptionsComponent extends AbstractOptionDirective {
  conditions = values(Condition);
  conditionInfo: any = conditionInfo;

  protected optionType = 'condition';
}
