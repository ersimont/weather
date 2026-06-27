import { inject, Service } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { ManualReinstallService } from 'app/misc-components/manual-reinstall/manual-reinstall.service';
import { LocationService } from 'app/misc-services/location.service';
import { OpenWeather } from 'app/sources/open-weather/open-weather';
import { VisualCrossing } from 'app/sources/visual-crossing/visual-crossing';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { WeatherUnlocked } from 'app/sources/weather-unlocked/weather-unlocked';
import { SourceId } from 'app/state/source';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

@Service()
export class InitService {
  private domSanitizer = inject(DomSanitizer);
  private locationService = inject(LocationService);
  private manualReinstallService = inject(ManualReinstallService);
  private matIconRegistry = inject(MatIconRegistry);
  private matSnackBar = inject(MatSnackBar);
  private openWeather = inject(OpenWeather);
  private visualCrossing = inject(VisualCrossing);
  private weatherGov = inject(WeatherGov);
  private weatherUnlocked = inject(WeatherUnlocked);
  private whatsNewService = inject(WhatsNewService);

  initializeApp(): void {
    this.openWeather.initialize();
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
