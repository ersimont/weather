import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AboutComponent } from 'app/misc-components/about/about.component';
import { PrivacyPolicyComponent } from 'app/misc-components/privacy-policy/privacy-policy.component';
import { InitService } from 'app/misc-services/init.service';
import { LocationService } from 'app/misc-services/location.service';
import { ViewRange } from 'app/state/viewRange';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { HttpStatusService } from 'app/to-replace/http-status.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DirectiveSuperclass } from '@s-libs/ng-core';
import { GraphComponent } from './graph/graph.component';
import { MatListModule } from '@angular/material/list';
import { OptionsComponent } from './options/options.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    MatProgressBarModule,
    MatSidenavModule,
    OptionsComponent,
    MatListModule,
    GraphComponent,
    AsyncPipe,
  ],
})
export class AppComponent extends DirectiveSuperclass {
  title$: Observable<string>;
  @ViewChild('sidenav', { read: MatSidenav }) private sidenav!: MatSidenav;

  constructor(
    private eventTrackingService: EventTrackingService,
    public httpStatusService: HttpStatusService,
    injector: Injector,
    initService: InitService,
    private locationService: LocationService,
    private matDialog: MatDialog,
    private store: WeatherStore,
  ) {
    super(injector);
    initService.initializeApp();

    this.title$ = locationService.$.pipe(
      map((location) => location.city || 'Weather Graph'),
    );
    this.openSideNavWhenAsked();
  }

  setRange(days: number, action: string): void {
    this.store('viewRange').state = new ViewRange(days);
    this.eventTrackingService.track(action, 'set_range');
  }

  showAbout(): void {
    this.matDialog.open(AboutComponent);
    this.eventTrackingService.track('click_about', 'navigate');
  }

  showPrivacyPolicy(): void {
    this.matDialog.open(PrivacyPolicyComponent);
    this.eventTrackingService.track('click_privacy_policy', 'navigate');
  }

  private openSideNavWhenAsked(): void {
    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.sidenav.open();
    });
  }
}
