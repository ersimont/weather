import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { SetRangeAction } from 'app/misc-components/graph/set-range-action';
import { PrivacyPolicyComponent } from 'app/misc-components/privacy-policy/privacy-policy.component';
import { LocationService } from 'app/misc-services/location.service';
import { Climacell } from 'app/sources/climacell/climacell';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { WeatherUnlocked } from 'app/sources/weather-unlocked/weather-unlocked';
import { SourceId } from 'app/state/source';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import { HttpStatusService } from 'app/to-replace/http-status.service';
import { WhatsNewService } from 'app/upgrade/whats-new.service';
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

  // TODO: fix linting here
  constructor(
    climacell: Climacell,
    domSanitizer: DomSanitizer,
    private eventTrackingService: EventTrackingService,
    public httpStatusService: HttpStatusService,
    injector: Injector,
    private locationService: LocationService,
    private matDialog: MatDialog,
    matIconRegistry: MatIconRegistry,
    private store: WeatherStore,
    weatherGov: WeatherGov,
    weatherUnlocked: WeatherUnlocked,
    whatsNewService: WhatsNewService,
  ) {
    super(injector);
    this.title$ = locationService.$.pipe(
      map((location) => location.city || 'Weather Graph'),
    );

    climacell.initialize();
    weatherGov.initialize(SourceId.WEATHER_UNLOCKED);
    weatherUnlocked.initialize();
    matIconRegistry.addSvgIconSetLiteral(
      domSanitizer.bypassSecurityTrustHtml(icons),
    );

    whatsNewService.showNewFeatures();
    this.openSideNavWhenAsked();
  }

  setRange(days: number, action: string) {
    this.store.dispatch(new SetRangeAction(days));
    this.eventTrackingService.track(action, 'set_range');
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
