import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { Climacell } from 'app/sources/climacell/climacell';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { WeatherUnlocked } from 'app/sources/weather-unlocked/weather-unlocked';
import { SourceId } from 'app/state/source';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

@Injectable({ providedIn: 'root' })
export class InitService {
  constructor(
    private climacell: Climacell,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
    private whatsNewService: WhatsNewService,
  ) {}

  initializeApp() {
    this.climacell.initialize();
    this.weatherGov.initialize(SourceId.WEATHER_UNLOCKED);
    this.weatherUnlocked.initialize();
    this.matIconRegistry.addSvgIconSetLiteral(
      this.domSanitizer.bypassSecurityTrustHtml(icons),
    );
    this.whatsNewService.showNewFeatures();
  }
}
