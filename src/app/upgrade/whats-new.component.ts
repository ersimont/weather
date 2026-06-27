import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-whats-new',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './whats-new.component.html',
})
export class WhatsNewComponent {
  features: string[];

  constructor() {
    this.features = inject(MAT_DIALOG_DATA).features;
  }
}
