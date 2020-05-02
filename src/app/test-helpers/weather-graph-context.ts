import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DebugElement } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  createHostFactory,
  createSpyObject,
  HostComponent,
  SpectatorHost,
  SpectatorHostFactory,
} from "@ngneat/spectator";
import { AppComponent } from "app/app.component";
import { AppComponentHarness } from "app/app.component.harness";
import { AppModule } from "app/app.module";
import { GraphComponentHarness } from "app/graph/graph.component.harness";
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { UnitOptionsComponentHarness } from "app/options/unit-options/unit-options.component.harness";
import { BrowserService } from "app/services/browser.service";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/services/refresh.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov/weather-gov.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked/weather-unlocked.harness";
import { GpsCoords } from "app/state/location";
import { WeatherState } from "app/state/weather-state";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
import { AngularContext } from "app/to-replace/test-context/angular-context";
import { expectSingleCallAndReset } from "s-ng-dev-utils";

const hostTemplate = `
  <div
    [style.width.px]="width"
    [style.height.px]="height"
    style="position: relative; margin: 20px auto; border: 1px solid;"
  >
    <app-root></app-root>
  </div>
`;

export class WeatherGraphContext extends AngularContext {
  private static createHost: SpectatorHostFactory<AppComponent, HostComponent>;

  initialState = new WeatherState();
  screenSize = { width: 400, height: 600 };
  currentLocation: GpsCoords = [144, -122];

  mocks = {
    browser: createSpyObject(BrowserService),
    eventTracking: createSpyObject(EventTrackingService),
    snackBar: createSpyObject(MatSnackBar),
  };

  harnesses = {
    app: new AppComponentHarness(this),
    gov: new WeatherGovHarness(this),
    graph: new GraphComponentHarness(this),
    iq: new LocationIqServiceHarness(this),
    location: new LocationOptionsComponentHarness(this),
    refresh: new RefreshServiceHarness(this),
    sources: new SourceOptionsComponentHarness(this),
    units: new UnitOptionsComponentHarness(this),
    unlocked: new WeatherUnlockedHarness(this),
  };

  rootElement!: Element;
  debugElement!: DebugElement;

  protected spectator!: SpectatorHost<AppComponent>;

  static setUp() {
    AngularContext.setUp();
    WeatherGraphContext.createHost = createHostFactory({
      component: AppComponent,
      declareComponent: false,
      imports: [AppModule, HttpClientTestingModule],
    });
  }

  constructor() {
    super();
    this.mocks.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    this.mocks.browser.hasFocus.and.returnValue(true);
  }

  init() {
    localStorage.setItem("weather", JSON.stringify(this.initialState));
    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.screenSize,
      providers: [
        { provide: BrowserService, useValue: this.mocks.browser },
        { provide: EventTrackingService, useValue: this.mocks.eventTracking },
        { provide: MatSnackBar, useValue: this.mocks.snackBar },
      ],
    });
    this.rootElement = this.spectator.hostElement;
    this.debugElement = this.spectator.debugElement;
    this.tick();
  }

  cleanUp() {
    super.cleanUp();
    this.tick(1); // the CDK does this for its FocusManager
  }

  expectErrorShown(message: string) {
    expectSingleCallAndReset(this.mocks.snackBar.open, message, "OK", {
      duration: 5000,
    });
  }

  expectNoErrorShown() {
    expect(this.mocks.snackBar.open).not.toHaveBeenCalled();
  }
}
