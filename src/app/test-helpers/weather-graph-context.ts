import { HttpClientTestingModule } from "@angular/common/http/testing";
import { tick } from "@angular/core/testing";
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
import { GpsCoords, Location } from "app/state/location";
import { AngularContext } from "app/test-helpers/angular-context";
import { expectLocationIqReverse } from "app/test-helpers/request-helpers";
import { EventTrackingService } from "app/to-replace/event-tracking/event-tracking.service";

const hostTemplate = `
  <div
    [style.width.px]="width"
    [style.height.px]="height"
    style="position: relative"
  >
    <app-root></app-root>
  </div>
`;

export class WeatherGraphContext extends AngularContext {
  private static createHost: SpectatorHostFactory<AppComponent, HostComponent>;

  spectator!: SpectatorHost<AppComponent>;
  hostSize = { width: 400, height: 600 };

  currentLocation: GpsCoords = [144, -122];
  browserService = createSpyObject(BrowserService);
  eventTrackingService = createSpyObject(EventTrackingService);

  static setup() {
    AngularContext.setup();
    WeatherGraphContext.createHost = createHostFactory({
      component: AppComponent,
      declareComponent: false,
      imports: [AppModule, HttpClientTestingModule],
      disableAnimations: true,
    });
  }

  constructor() {
    super();
    this.setState(new Location());
    this.browserService.getCurrentLocation.and.callFake(
      async () => this.currentLocation,
    );
  }

  init() {
    this.spectator = WeatherGraphContext.createHost(hostTemplate, {
      hostProps: this.hostSize,
      providers: [
        { provide: BrowserService, useValue: this.browserService },
        { provide: EventTrackingService, useValue: this.eventTrackingService },
      ],
    });
    tick();
    this.spectator.detectComponentChanges();
    expectLocationIqReverse();
  }

  setState(state: Location) {
    localStorage.setItem("weather", JSON.stringify(state));
  }
}
