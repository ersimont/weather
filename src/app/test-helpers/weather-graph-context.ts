import { HttpClientTestingModule } from "@angular/common/http/testing";
import { tick } from "@angular/core/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {
  createHostFactory,
  createSpyObject,
  HostComponent,
  SpectatorHost,
  SpectatorHostFactory,
} from "@ngneat/spectator";
import { AppComponent } from "app/app.component";
import { AppModule } from "app/app.module";
import { BrowserService } from "app/services/browser.service";
import { GpsCoords } from "app/state/location";
import { WeatherState } from "app/state/weather-state";
import { ComponentContext } from "app/to-replace/component-context";
import { SidenavPage } from "app/test-helpers/sidenav-page";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";
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

export class WeatherGraphContext extends ComponentContext {
  private static createHost: SpectatorHostFactory<AppComponent, HostComponent>;

  spectator!: SpectatorHost<AppComponent>;
  hostSize = { width: 400, height: 600 };

  currentLocation: GpsCoords = [144, -122];
  initialState = new WeatherState();

  browserService = createSpyObject(BrowserService);
  eventTrackingService = createSpyObject(EventTrackingService);
  matSnackBar = createSpyObject(MatSnackBar);

  sidenav = new SidenavPage(this);

  static setup() {
    ComponentContext.setup();
    WeatherGraphContext.createHost = createHostFactory({
      component: AppComponent,
      declareComponent: false,
      imports: [AppModule, HttpClientTestingModule, NoopAnimationsModule],
    });
  }

  constructor() {
    super();
    this.browserService.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
  }

  init() {
    localStorage.setItem("weather", JSON.stringify(this.initialState));
    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.hostSize,
      providers: [
        { provide: BrowserService, useValue: this.browserService },
        { provide: EventTrackingService, useValue: this.eventTrackingService },
        { provide: MatSnackBar, useValue: this.matSnackBar },
      ],
    });
    tick();
    this.spectator.detectComponentChanges();
    tick();
  }

  expectErrorShown(message: string) {
    expectSingleCallAndReset(this.matSnackBar.open, message, "OK", {
      duration: 5000,
    });
  }

  expectNoErrorShown() {
    expect(this.matSnackBar.open).not.toHaveBeenCalled();
  }
}
