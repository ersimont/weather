import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createSpyObject } from '@s-libs/ng-dev';
import { AppModule } from 'app/app.module';
import { GraphComponentHarness } from 'app/graph/graph.component.harness';
import { BrowserService } from 'app/misc-services/browser.service';
import { InitServiceHarness } from 'app/misc-services/init.service.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { OpenWeatherHarness } from 'app/sources/open-weather/open-weather.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { eventCatalog } from 'app/test-helpers/event-catalog';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';
import {
  ComponentContext,
  ComponentContextInit,
} from 'app/to-replace/test-context/component-context';

export interface InitOptions extends ComponentContextInit<TestComponent> {
  useInitialState: boolean;
}

export class WeatherGraphContext extends ComponentContext<
  TestComponent,
  InitOptions
> {
  initialState = new WeatherState();
  currentLocation: GpsCoords = [144, -122];

  // TODO: move to harness
  mocks = { browser: createSpyObject(BrowserService) };

  harnesses = {
    climacell: new ClimacellHarness(this),
    events: new EventTrackingServiceHarness(eventCatalog),
    errors: new SnackBarErrorServiceHarness(this),
    gov: new WeatherGovHarness(this),
    graph: new GraphComponentHarness(this),
    init: new InitServiceHarness(this),
    iq: new LocationIqServiceHarness(this),
    openWeather: new OpenWeatherHarness(this),
    refresh: new RefreshServiceHarness(this),
    state: new WeatherStateHarness(this),
    store: new WeatherStoreHarness(),
    unlocked: new WeatherUnlockedHarness(this),
  };

  protected componentType = TestComponent;

  constructor() {
    super({ imports: [AppModule], declarations: [TestComponent] });

    this.mocks.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    this.mocks.browser.hasFocus.and.returnValue(true);
    TestBed.overrideProvider(BrowserService, { useValue: this.mocks.browser });
    this.harnesses.errors.install();
  }

  cleanUpFreshInit(): void {
    this.harnesses.init.cleanUpFreshInit();
  }

  protected init({ useInitialState = true }: Partial<InitOptions> = {}): void {
    if (useInitialState) {
      localStorage.setItem('weather', JSON.stringify(this.initialState));
    } else {
      localStorage.removeItem('weather');
    }

    super.init({});
  }

  protected verifyPostTestConditions(): void {
    super.verifyPostTestConditions();
    this.harnesses.events.validateEvents();
    this.harnesses.errors.verify();
  }

  protected cleanUp(): void {
    super.cleanUp();

    // https://github.com/angular/components/blob/b612fc42895e47377b353e773d4ba3517c0991e1/src/material/dialog/dialog.spec.ts#L80
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(1); // the CDK queues this up for its FocusManager
    this.tick(150); // material ripple effect
  }
}

@Component({
  template: `
    <div
      style="width: 400px; height: 600px; position: relative; margin: 20px auto; border: 1px solid;"
    >
      <app-root></app-root>
    </div>
  `,
})
class TestComponent {}
