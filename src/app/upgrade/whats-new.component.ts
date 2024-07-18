import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface WhatsNewDialogData {
  features: string[];
}

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class WhatsNewComponent {
  features: string[];

  constructor(@Inject(MAT_DIALOG_DATA) data: WhatsNewDialogData) {
    this.features = data.features;
  }
}
