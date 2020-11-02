import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { SourceId } from 'app/state/source';
import { values } from '@s-libs/micro-dash';

@Component({
  selector: 'app-source-options',
  templateUrl: './source-options.component.html',
  styleUrls: ['./source-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceOptionsComponent extends AbstractOptionDirective {
  sourceIds = values(SourceId);

  protected optionType = 'source';
}
