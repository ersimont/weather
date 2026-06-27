import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventTrackingService } from 'app/to-replace/mixpanel-core/event-tracking.service';
import { WhatsNewComponent } from 'app/upgrade/whats-new.component';

@Service()
export class WhatsNewService {
  private eventTrackingService = inject(EventTrackingService);
  private matDialog = inject(MatDialog);

  private features: string[] = [];

  add(feature: string): void {
    this.features.unshift(feature);
  }

  showNewFeatures(): void {
    if (this.features.length) {
      this.matDialog.open(WhatsNewComponent, {
        data: { features: this.features },
      });
      this.eventTrackingService.track('show_whats_new', {
        category: 'initialization',
      });
    }
  }
}
