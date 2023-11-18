import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';

interface WhatsNewDialogData {
  features: string[];
}

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatDialogModule, NgFor, MatButtonModule],
})
export class WhatsNewComponent {
  features: string[];

  constructor(@Inject(MAT_DIALOG_DATA) data: WhatsNewDialogData) {
    this.features = data.features;
  }
}
