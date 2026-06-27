import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManualReinstallComponent } from 'app/misc-components/manual-reinstall/manual-reinstall.component';

@Service()
export class ManualReinstallService {
  private readonly matDialog = inject(MatDialog);

  promptIfAppropriate(): void {
    if (
      document.referrer.includes('ersimont.github.io') &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      this.matDialog.open(ManualReinstallComponent);
    }
  }
}
