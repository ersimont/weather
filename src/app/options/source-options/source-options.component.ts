import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';
import { SourceId } from 'app/state/source';
import { values } from '@s-libs/micro-dash';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-source-options',
  templateUrl: './source-options.component.html',
  styleUrl: './source-options.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    NgFor,
  ],
})
export class SourceOptionsComponent extends AbstractOptionDirective {
  sourceIds = values(SourceId);

  protected optionType = 'source';
}
