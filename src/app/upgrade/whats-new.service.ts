import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { WhatsNewComponent } from "app/upgrade/whats-new.component";

@Injectable({ providedIn: "root" })
export class WhatsNewService {
  private features: string[] = [];

  constructor(private matDialog: MatDialog) {}

  add(feature: string) {
    this.features.push(feature);
  }

  showNewFeatures() {
    if (this.features.length) {
      this.matDialog.open(WhatsNewComponent, {
        data: { features: this.features },
      });
    }
  }
}
