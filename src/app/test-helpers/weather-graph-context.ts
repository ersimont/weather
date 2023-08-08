import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ComponentContext, createSpyObject } from '@s-libs/ng-dev';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { ManualReinstallServiceHarness } from 'app/misc-components/manual-reinstall/manual-reinstall.service.harness';
import { BrowserService } from 'app/misc-services/browser.service';
import { InitServiceHarness } from 'app/misc-services/init.service.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { OpenWeatherHarness } from 'app/sources/open-weather/open-weather.harness';
import { VisualCrossingHarness } from 'app/sources/visual-crossing/visual-crossing.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { eventCatalog } from 'app/test-helpers/event-catalog';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { IsPageVisibleHarness } from 'app/to-replace/ng-dev/is-page-visible.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

export class WeatherGraphContext extends ComponentContext<AppComponent> {
  initialState = new WeatherState();
  currentLocation: GpsCoords = [144, -122];
  useInitialState = true;

  // TODO: move to harness
  mocks = { browser: createSpyObject(BrowserService) };

  isPageVisibleHarness = new IsPageVisibleHarness();
  // TODO: move to create in individual tests?
  harnesses = {
    crossing: new VisualCrossingHarness(this),
    errors: new SnackBarErrorServiceHarness(this),
    events: new EventTrackingServiceHarness(eventCatalog),
    gov: new WeatherGovHarness(this),
    graph: new GraphComponentHarness(this),
    init: new InitServiceHarness(this),
    iq: new LocationIqServiceHarness(this),
    manualReinstall: new ManualReinstallServiceHarness(),
    openWeather: new OpenWeatherHarness(this),
    refresh: new RefreshServiceHarness(this),
    state: new WeatherStateHarness(this),
    store: new WeatherStoreHarness(),
    unlocked: new WeatherUnlockedHarness(this),
  };

  constructor() {
    super(AppComponent, appConfig);

    this.mocks.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    TestBed.overrideProvider(BrowserService, { useValue: this.mocks.browser });
    this.harnesses.errors.install();
    this.assignWrapperStyles({
      width: '400px',
      height: '600px',
      position: 'relative',
      margin: '20px auto',
      border: '1px solid',
    });
  }

  async cleanUpFreshInit(): Promise<void> {
    await this.harnesses.init.cleanUpFreshInit();
  }

  protected override init(): void {
    if (this.useInitialState) {
      localStorage.setItem('weather', JSON.stringify(this.initialState));
    } else {
      localStorage.removeItem('weather');
    }

    super.init();
  }

  protected override verifyPostTestConditions(): void {
    super.verifyPostTestConditions();
    this.harnesses.events.validateEvents();
    this.harnesses.errors.verify();
  }

  protected override cleanUp(): void {
    // chart.js needs time to advance to avoid an infinite animation loop in flush()
    this.tick(1);

    super.cleanUp();

    // https://github.com/angular/components/blob/b612fc42895e47377b353e773d4ba3517c0991e1/src/material/dialog/dialog.spec.ts#L80
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(1); // the CDK queues this up for its FocusManager
    this.tick(150); // material ripple effect
  }
}
