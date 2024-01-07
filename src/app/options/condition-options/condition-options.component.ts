import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { Condition, conditionInfo } from 'app/state/condition';
import { values } from '@s-libs/micro-dash';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgFor, NgClass } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-condition-options',
  templateUrl: './condition-options.component.html',
  styleUrl: './condition-options.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    NgClass,
    NgFor,
  ],
})
export class ConditionOptionsComponent extends AbstractOptionDirective {
  conditions = values(Condition);
  conditionInfo: any = conditionInfo;

  protected optionType = 'condition';
}
