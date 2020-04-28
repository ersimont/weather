import { HttpClientTestingModule } from "@angular/common/http/testing";
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

  spectator!: SpectatorHost<AppComponent>;
  screenSize = { width: 400, height: 600 };

  currentLocation: GpsCoords = [144, -122];
  initialState = new WeatherState();

  browserService = createSpyObject(BrowserService);
  eventTrackingService = createSpyObject(EventTrackingService);
  matSnackBar = createSpyObject(MatSnackBar);

  static setup() {
    AngularContext.setup();
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
    this.browserService.hasFocus.and.returnValue(true);
  }

  init() {
    localStorage.setItem("weather", JSON.stringify(this.initialState));
    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.screenSize,
      providers: [
        { provide: BrowserService, useValue: this.browserService },
        { provide: EventTrackingService, useValue: this.eventTrackingService },
        { provide: MatSnackBar, useValue: this.matSnackBar },
      ],
    });
    this.tick();
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
