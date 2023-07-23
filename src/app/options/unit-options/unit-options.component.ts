import { ChangeDetectionStrategy, Component } from '@angular/core';
import { values } from '@s-libs/micro-dash';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { AmountUnit, SpeedUnit, TempUnit } from 'app/state/units';
import { NasModelModule } from '@s-libs/ng-app-state';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgFor, UpperCasePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-unit-options',
    templateUrl: './unit-options.component.html',
    styleUrls: ['./unit-options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatExpansionModule,
        NgFor,
        MatButtonToggleModule,
        NasModelModule,
        UpperCasePipe,
    ],
})
export class UnitOptionsComponent extends AbstractOptionDirective {
  // ngFor was not dealing well with this when using `as const`. maybe try again in a future angular version
  unitOptions: any[] = [
    { type: 'temp', options: values(TempUnit) },
    { type: 'amount', options: values(AmountUnit) },
    { type: 'speed', options: values(SpeedUnit) },
  ];

  protected optionType = 'unit';
}
