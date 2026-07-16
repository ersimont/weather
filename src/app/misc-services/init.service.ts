import { afterNextRender, inject, Service } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from 'app/icons';
import { LocationService } from 'app/misc-services/location.service';
import { OpenMateo } from 'app/sources/open-mateo/open-mateo';
import { OpenWeather } from 'app/sources/open-weather/open-weather';
import { VisualCrossing } from 'app/sources/visual-crossing/visual-crossing';
import { WeatherGov } from 'app/sources/weather-gov/weather-gov';
import { SourceId } from 'app/state/source';
import { WhatsNewService } from 'app/upgrade/whats-new.service';

@Service()
export class InitService {
  readonly #domSanitizer = inject(DomSanitizer);
  readonly #locationService = inject(LocationService);
  readonly #matIconRegistry = inject(MatIconRegistry);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #openMateo = inject(OpenMateo);
  readonly #openWeather = inject(OpenWeather);
  readonly #visualCrossing = inject(VisualCrossing);
  readonly #weatherGov = inject(WeatherGov);
  readonly #whatsNewService = inject(WhatsNewService);

  initializeApp(): void {
    this.#openMateo.initialize();
    this.#openWeather.initialize();
    this.#visualCrossing.initialize();
    this.#weatherGov.initialize(SourceId.OPEN_WEATHER);
    this.#matIconRegistry.addSvgIconSetLiteral(
      this.#domSanitizer.bypassSecurityTrustHtml(icons),
    );

    this.#whatsNewService.showNewFeatures();
    if (this.#locationService.isBlank()) {
      afterNextRender(() => {
        // wait until the sidenav renders before asking it to open
        this.#locationService.askForLocation$.next();
      });
      setTimeout(() => {
        this.#matSnackBar.open('Choose a location', 'OK', { duration: 5000 });
      }, 2000);
    }
  }
}
