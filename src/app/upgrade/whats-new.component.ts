import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface WhatsNewDialogData {
  features: string[];
}

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsNewComponent {
  features: string[];

  constructor(@Inject(MAT_DIALOG_DATA) data: WhatsNewDialogData) {
    this.features = data.features;
  }
}
