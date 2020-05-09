import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppComponentHarness } from 'app/app.component.harness';
import { AppModule } from 'app/app.module';
import { GraphComponentHarness } from 'app/misc-components/graph/graph.component.harness';
import { BrowserService } from 'app/misc-services/browser.service';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { LocationOptionsComponentHarness } from 'app/options/location-options/location-options.component.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { ClimacellHarness } from 'app/sources/climacell/climacell.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherUnlockedHarness } from 'app/sources/weather-unlocked/weather-unlocked.harness';
import { GpsCoords } from 'app/state/location';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { eventCatalog } from 'app/test-helpers/event-catalog';
import { createSpyOfType } from 'app/to-replace/create-spy-of-type';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';
import { ComponentContext } from 'app/to-replace/test-context/component-context';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';
import { expectSingleCallAndReset } from 's-ng-dev-utils';

export interface InitOptions {
  flushDefaultRequests: boolean;
  useInitialState: boolean;
}

export class WeatherGraphContext extends ComponentContext<
  TestComponent,
  InitOptions
> {
  initialState = new WeatherState();
  currentLocation: GpsCoords = [144, -122];

  // TODO: move to harnesses
  mocks = {
    browser: createSpyOfType(BrowserService),
    snackBar: createSpyOfType(MatSnackBar),
  };

  harnesses = {
    app: new AppComponentHarness(this),
    climacell: new ClimacellHarness(this),
    events: new EventTrackingServiceHarness(eventCatalog),
    gov: new WeatherGovHarness(this),
    graph: new GraphComponentHarness(this),
    iq: new LocationIqServiceHarness(this),
    location: new LocationOptionsComponentHarness(this),
    refresh: new RefreshServiceHarness(this),
    sources: new SourceOptionsComponentHarness(this),
    state: new WeatherStateHarness(this),
    store: new WeatherStoreHarness(),
    units: new UnitOptionsComponentHarness(this),
    unlocked: new WeatherUnlockedHarness(this),
    whatsNew: new WhatsNewComponentHarness(),
  };

  rootElement!: Element;
  debugElement!: DebugElement;

  protected componentType = TestComponent;

  constructor() {
    super({ imports: [AppModule], declarations: [TestComponent] });

    this.mocks.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    this.mocks.browser.hasFocus.and.returnValue(true);
    TestBed.overrideProvider(BrowserService, { useValue: this.mocks.browser });
    TestBed.overrideProvider(MatSnackBar, { useValue: this.mocks.snackBar });
  }

  // TODO: move to harness (along w/ other error expectations below)
  expectGenericErrorShown() {
    this.expectErrorShown('There was an unexpected error');
  }

  expectErrorShown(message: string) {
    expectSingleCallAndReset(this.mocks.snackBar.open, message, 'OK', {
      duration: 5000,
    });
  }

  expectNoErrorShown() {
    expect(this.mocks.snackBar.open).not.toHaveBeenCalled();
  }

  protected init({
    flushDefaultRequests = true,
    useInitialState = true,
  }: Partial<InitOptions> = {}) {
    if (useInitialState) {
      localStorage.setItem('weather', JSON.stringify(this.initialState));
    } else {
      localStorage.removeItem('weather');
    }

    super.init({});

    // TODO: remove these & just use fixture?
    this.rootElement = this.fixture.nativeElement;
    this.debugElement = this.fixture.debugElement;

    if (flushDefaultRequests) {
      this.harnesses.iq.flushReverse();
      this.harnesses.gov.flushFixture();
    }
  }

  protected cleanUp() {
    super.cleanUp();

    this.harnesses.events.validateEvents();

    // https://github.com/angular/components/blob/b612fc42895e47377b353e773d4ba3517c0991e1/src/material/dialog/dialog.spec.ts#L80
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(1); // the CDK queues this up for its FocusManager
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
