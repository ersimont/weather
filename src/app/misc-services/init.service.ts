import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { LocationService } from 'app/misc-services/location.service';
import { Climacell } from 'app/sources/climacell/climacell';
import { OpenWeather } from 'app/sources/open-weather/open-weather';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { WeatherUnlocked } from 'app/sources/weather-unlocked/weather-unlocked';
import { SourceId } from 'app/state/source';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private climacell: Climacell,
    private domSanitizer: DomSanitizer,
    private locationService: LocationService,
    private matIconRegistry: MatIconRegistry,
    private matSnackBar: MatSnackBar,
    private openWeather: OpenWeather,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
    private whatsNewService: WhatsNewService,
  ) {}

  initializeApp(): void {
    this.climacell.initialize();
    this.openWeather.initialize();
    this.weatherGov.initialize(SourceId.WEATHER_UNLOCKED);
    this.weatherUnlocked.initialize();
    this.matIconRegistry.addSvgIconSetLiteral(
      this.domSanitizer.bypassSecurityTrustHtml(icons),
    );

    this.whatsNewService.showNewFeatures();
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
