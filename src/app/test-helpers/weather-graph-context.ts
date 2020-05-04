import { OverlayContainer } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DebugElement } from "@angular/core";
import { ComponentFixtureAutoDetect } from "@angular/core/testing";
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
import { GraphComponentHarness } from "app/misc-components/graph/graph.component.harness";
import { BrowserService } from "app/misc-services/browser.service";
import { LocationIqServiceHarness } from "app/misc-services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/misc-services/refresh.service.harness";
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { UnitOptionsComponentHarness } from "app/options/unit-options/unit-options.component.harness";
import { ClimacellHarness } from "app/sources/climacell/climacell.harness";
import { WeatherGovHarness } from "app/sources/weather-gov/weather-gov.harness";
import { WeatherUnlockedHarness } from "app/sources/weather-unlocked/weather-unlocked.harness";
import { GpsCoords } from "app/state/location";
import { WeatherState } from "app/state/weather-state";
import { WeatherStateHarness } from "app/state/weather-state.harness";
import { WeatherStoreHarness } from "app/state/weather-store.harness";
import { eventCatalog } from "app/test-helpers/event-catalog";
import { EventTrackingServiceHarness } from "app/to-replace/event-tracking/event-tracking.service.harness";
import { AngularContext } from "app/to-replace/test-context/angular-context";
import { WhatsNewComponentHarness } from "app/upgrade/whats-new.component.harness";
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
  // TODO: remove spectator?
  private static createHost: SpectatorHostFactory<AppComponent, HostComponent>;

  initialState = new WeatherState();
  screenSize = { width: 400, height: 600 };
  currentLocation: GpsCoords = [144, -122];

  // TODO: move to harnesses
  mocks = {
    browser: createSpyObject(BrowserService),
    snackBar: createSpyObject(MatSnackBar),
  };

  harnesses = {
    app: new AppComponentHarness(this),
    climacell: new ClimacellHarness(this),
    events: new EventTrackingServiceHarness(),
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

  protected spectator!: SpectatorHost<AppComponent>;

  static setUp() {
    WeatherGraphContext.createHost = createHostFactory({
      component: AppComponent,
      declareComponent: false,
      imports: [AppModule, HttpClientTestingModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
    });
  }

  constructor() {
    super();
    this.mocks.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    this.mocks.browser.hasFocus.and.returnValue(true);
  }

  init({ flushDefaultRequests = true } = {}) {
    localStorage.setItem("weather", JSON.stringify(this.initialState));

    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.screenSize,
      providers: [
        { provide: BrowserService, useValue: this.mocks.browser },
        { provide: MatSnackBar, useValue: this.mocks.snackBar },
      ],
    });
    this.fixture = this.spectator.fixture;
    this.rootElement = this.spectator.hostElement;
    this.debugElement = this.spectator.debugElement;

    this.tick();
    if (flushDefaultRequests) {
      this.harnesses.iq.flushReverse();
      this.harnesses.gov.flushFixture();
    }
  }

  cleanUp() {
    super.cleanUp();

    this.harnesses.events.validateEvents(eventCatalog);

    // https://github.com/angular/components/blob/b612fc42895e47377b353e773d4ba3517c0991e1/src/material/dialog/dialog.spec.ts#L80
    this.inject(OverlayContainer).ngOnDestroy();
    this.tick(1); // the CDK queues this up for its FocusManager
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
