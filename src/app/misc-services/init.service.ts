import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { ManualReinstallService } from 'app/misc-components/manual-reinstall/manual-reinstall.service';
import { LocationService } from 'app/misc-services/location.service';
import { TomorrowIo } from 'app/sources/tomorrow-io/tomorrow-io';
import { OpenWeather } from 'app/sources/open-weather/open-weather';
import { VisualCrossing } from 'app/sources/visual-crossing/visual-crossing';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { WeatherUnlocked } from 'app/sources/weather-unlocked/weather-unlocked';
import { SourceId } from 'app/state/source';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private domSanitizer: DomSanitizer,
    private locationService: LocationService,
    private manualReinstallService: ManualReinstallService,
    private matIconRegistry: MatIconRegistry,
    private matSnackBar: MatSnackBar,
    private openWeather: OpenWeather,
    private tomorrowIo: TomorrowIo,
    private visualCrossing: VisualCrossing,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
    private whatsNewService: WhatsNewService,
  ) {}

  initializeApp(): void {
    this.openWeather.initialize();
    this.tomorrowIo.initialize();
    this.visualCrossing.initialize();
    this.weatherGov.initialize(SourceId.WEATHER_UNLOCKED);
    this.weatherUnlocked.initialize();
    this.matIconRegistry.addSvgIconSetLiteral(
      this.domSanitizer.bypassSecurityTrustHtml(icons),
    );

    this.whatsNewService.showNewFeatures();
    this.manualReinstallService.promptIfAppropriate();
    if (this.locationService.isBlank()) {
      setTimeout(() => {
        this.locationService.askForLocation$.next();
      });
      setTimeout(() => {
        this.matSnackBar.open('Choose a location', 'OK', { duration: 5000 });
      }, 2000);
    }
  }
}
