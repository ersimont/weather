import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-manual-reinstall',
  templateUrl: './manual-reinstall.component.html',
  styleUrls: ['./manual-reinstall.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualReinstallComponent {}
