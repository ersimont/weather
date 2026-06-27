import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-manual-reinstall',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './manual-reinstall.component.html',
  styleUrl: './manual-reinstall.component.css',
})
export class ManualReinstallComponent {}
