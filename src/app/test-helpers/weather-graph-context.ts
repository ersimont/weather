import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentContext, createMockObject } from '@s-libs/ng-vitest';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { BrowserService } from 'app/misc-services/browser.service';
import { InitServiceHarness } from 'app/misc-services/init.service.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { OpenMateoHarness } from 'app/sources/open-mateo/open-mateo.harness';
import { OpenWeatherHarness } from 'app/sources/open-weather/open-weather.harness';
import { VisualCrossingHarness } from 'app/sources/visual-crossing/visual-crossing.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { mixpanelTestProviders } from 'app/to-replace/mixpanel-core/mixpanel.service.harness';
import { IsPageVisibleHarness } from 'app/to-replace/ng-dev/is-page-visible.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';
import { provideMockPersistence } from '../to-replace/ng-vitest/provide-persistence.harness';

export class WeatherGraphContext extends ComponentContext<AppComponent> {
  initialState = new WeatherState();
  currentLocation: GpsCoords = [144, -122];
  useInitialState = true;

  // TODO: move to harness
  mocks = { browser: createMockObject(BrowserService) };

  isPageVisibleHarness = new IsPageVisibleHarness();
  // TODO: move to create in individual tests?
  harnesses = {
    crossing: new VisualCrossingHarness(this),
    errors: new SnackBarErrorServiceHarness(this),
    gov: new WeatherGovHarness(this),
    graph: new GraphComponentHarness(this),
    init: new InitServiceHarness(this),
    iq: new LocationIqServiceHarness(this),
    mateo: new OpenMateoHarness(this),
    openWeather: new OpenWeatherHarness(this),
    refresh: new RefreshServiceHarness(this),
    state: new WeatherStateHarness(this),
  };

  constructor() {
    super(AppComponent, {
      providers: [
        appConfig.providers,
        mixpanelTestProviders,
        provideMockPersistence(() => {
          console.log('providing pre-stored state', this.useInitialState);
          return this.useInitialState ? this.initialState : undefined;
        }),
      ],
    });

    this.mocks.browser.getCurrentLocation.mockImplementation(
      async () => this.currentLocation,
    );
    TestBed.overrideProvider(BrowserService, { useValue: this.mocks.browser });
    this.assignWrapperStyles({
      width: '400px',
      height: '600px',
      position: 'relative',
      margin: '20px auto',
      border: '1px solid',
    });
  }

  protected override async init(): Promise<void> {
    this.harnesses.errors.install();
    await super.init();
  }

  protected override verifyPostTestConditions(): void {
    super.verifyPostTestConditions();
    this.harnesses.errors.verify();
  }

  protected override async cleanUp(): Promise<void> {
    // chart.js needs time to advance to avoid an infinite animation loop in flush()
    await this.tick(1);

    this.inject(MatSnackBar).dismiss();
    this.inject(MatDialog).closeAll();
    await this.tick(0);

    await super.cleanUp();
  }
}
