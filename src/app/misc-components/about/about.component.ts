import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-about',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  preserveWhitespaces: true,
})
export class AboutComponent {}
