import { HttpClientTestingModule } from "@angular/common/http/testing";
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
import { LocationOptionsComponentHarness } from "app/options/location-options/location-options.component.harness";
import { SourceOptionsComponentHarness } from "app/options/source-options/source-options.component.harness";
import { BrowserService } from "app/services/browser.service";
import { LocationIqServiceHarness } from "app/services/location-iq.service.harness";
import { RefreshServiceHarness } from "app/services/refresh.service.harness";
import { WeatherGovHarness } from "app/sources/weather-gov.harness";
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

  mock = {
    browser: createSpyObject(BrowserService),
    eventTracking: createSpyObject(EventTrackingService),
    snackBar: createSpyObject(MatSnackBar),
  };

  help = {
    app: new AppComponentHarness(this),
    gov: new WeatherGovHarness(this),
    iq: new LocationIqServiceHarness(this),
    location: new LocationOptionsComponentHarness(this),
    refresh: new RefreshServiceHarness(this),
    sources: new SourceOptionsComponentHarness(this),
  };

  rootElement!: Element;

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
    this.mock.browser.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
    this.mock.browser.hasFocus.and.returnValue(true);
  }

  init() {
    localStorage.setItem("weather", JSON.stringify(this.initialState));
    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.screenSize,
      providers: [
        { provide: BrowserService, useValue: this.mock.browser },
        { provide: EventTrackingService, useValue: this.mock.eventTracking },
        { provide: MatSnackBar, useValue: this.mock.snackBar },
      ],
    });
    this.rootElement = this.spectator.hostElement;
    this.tick();
  }

  cleanUp() {
    super.cleanUp();
    this.tick(1); // the CDK does this for its FocusManager
  }

  expectErrorShown(message: string) {
    expectSingleCallAndReset(this.mock.snackBar.open, message, "OK", {
      duration: 5000,
    });
  }

  expectNoErrorShown() {
    expect(this.mock.snackBar.open).not.toHaveBeenCalled();
  }
}
