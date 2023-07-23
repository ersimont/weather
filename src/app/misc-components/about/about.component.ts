import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: true,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class AboutComponent {}
