import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { values } from '@s-libs/micro-dash';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { SourceId } from 'app/state/source';

@Component({
  selector: 'app-source-options',
  imports: [FormsModule, MatExpansionModule, MatSlideToggleModule],
  templateUrl: './source-options.component.html',
  styleUrl: './source-options.component.css',
})
export class SourceOptionsComponent extends AbstractOptionDirective {
  sourceIds = values(SourceId);

  protected optionType = 'source';
}
