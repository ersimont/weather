import { Component, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { InjectableSuperclass } from '@s-libs/ng-core';
import { AboutComponent } from 'app/misc-components/about/about.component';
import { PrivacyPolicyComponent } from 'app/misc-components/privacy-policy/privacy-policy.component';
import { InitService } from 'app/misc-services/init.service';
import { LocationService } from 'app/misc-services/location.service';
import { ViewRange } from 'app/state/viewRange';
import { WeatherStore } from 'app/state/weather-store';
import { HttpStatusService } from 'app/to-replace/http-status.service';
import { MixpanelService } from 'app/to-replace/mixpanel-core/mixpanel.service';
import { GraphComponent } from './graph/graph.component';
import { OptionsComponent } from './options/options.component';

@Component({
  selector: 'app-root',
  imports: [
    GraphComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    OptionsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent extends InjectableSuperclass {
  protected readonly httpStatusService = inject(HttpStatusService);
  protected readonly title = computed(
    () => this.#locationService.location().city ?? 'Weather Graph',
  );

  private readonly sidenav = viewChild.required(MatSidenav);

  readonly #eventTrackingService = inject(MixpanelService);
  readonly #locationService = inject(LocationService);
  readonly #matDialog = inject(MatDialog);
  readonly #store = inject(WeatherStore);

  constructor() {
    super();
    inject(InitService).initializeApp();

    this.#openSideNavWhenAsked();
  }

  setRange(days: number, action: string): void {
    this.#store('viewRange').state = new ViewRange(days);
    this.#eventTrackingService.track(action, { category: 'set_range' });
  }

  showAbout(): void {
    this.#matDialog.open(AboutComponent);
    this.#eventTrackingService.track('click_about', { category: 'navigate' });
  }

  showPrivacyPolicy(): void {
    this.#matDialog.open(PrivacyPolicyComponent);
    this.#eventTrackingService.track('click_privacy_policy', {
      category: 'navigate',
    });
  }

  #openSideNavWhenAsked(): void {
    this.subscribeTo(this.#locationService.askForLocation$, () => {
      this.sidenav().open();
    });
  }
}
