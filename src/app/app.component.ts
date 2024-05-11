import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DirectiveSuperclass } from '@s-libs/ng-core';
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
import { GraphComponent } from './graph/graph.component';
import { OptionsComponent } from './options/options.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    GraphComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    NgIf,
    OptionsComponent,
  ],
})
export class AppComponent extends DirectiveSuperclass {
  protected httpStatusService = inject(HttpStatusService);
  protected title$: Observable<string>;

  @ViewChild('sidenav', { read: MatSidenav }) private sidenav!: MatSidenav;
  private store = inject(WeatherStore);

  #eventTrackingService = inject(EventTrackingService);
  #locationService = inject(LocationService);
  #matDialog = inject(MatDialog);

  constructor(initService: InitService) {
    super();
    initService.initializeApp();

    this.title$ = this.#locationService.$.pipe(
      map((location) => location.city || 'Weather Graph'),
    );
    this.#openSideNavWhenAsked();
  }

  setRange(days: number, action: string): void {
    this.store('viewRange').state = new ViewRange(days);
    this.#eventTrackingService.track(action, 'set_range');
  }

  showAbout(): void {
    this.#matDialog.open(AboutComponent);
    this.#eventTrackingService.track('click_about', 'navigate');
  }

  showPrivacyPolicy(): void {
    this.#matDialog.open(PrivacyPolicyComponent);
    this.#eventTrackingService.track('click_privacy_policy', 'navigate');
  }

  #openSideNavWhenAsked(): void {
    this.subscribeTo(this.#locationService.askForLocation$, () => {
      this.sidenav.open();
    });
  }
}
