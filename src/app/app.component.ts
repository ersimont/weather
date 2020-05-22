import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { AboutComponent } from 'app/misc-components/about/about.component';
import { GraphStore } from 'app/misc-components/graph/graph-store';
import { PrivacyPolicyComponent } from 'app/misc-components/privacy-policy/privacy-policy.component';
import { InitService } from 'app/misc-services/init.service';
import { LocationService } from 'app/misc-services/location.service';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { HttpStatusService } from 'app/to-replace/http-status.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DirectiveSuperclass } from 's-ng-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends DirectiveSuperclass {
  title$: Observable<string>;
  @ViewChild('sidenav', { read: MatSidenav }) private sidenav!: MatSidenav;

  constructor(
    private eventTrackingService: EventTrackingService,
    private graphStore: GraphStore,
    public httpStatusService: HttpStatusService,
    injector: Injector,
    initService: InitService,
    private locationService: LocationService,
    private matDialog: MatDialog,
  ) {
    super(injector);
    initService.initializeApp();

    this.title$ = locationService.$.pipe(
      map((location) => location.city || 'Weather Graph'),
    );
    this.openSideNavWhenAsked();
  }

  setRange(days: number, action: string) {
    this.graphStore.snapToRange(days);
    this.eventTrackingService.track(action, 'set_range');
  }

  showAbout() {
    this.matDialog.open(AboutComponent);
    this.eventTrackingService.track('click_about', 'navigate');
  }

  showPrivacyPolicy() {
    this.matDialog.open(PrivacyPolicyComponent);
    this.eventTrackingService.track('click_privacy_policy', 'navigate');
  }

  private openSideNavWhenAsked() {
    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.sidenav.open();
    });
  }
}
