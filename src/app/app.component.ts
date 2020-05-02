import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { MatSidenav } from "@angular/material/sidenav";
import { DomSanitizer } from "@angular/platform-browser";
import { SetRangeAction } from "app/graph/set-range-action";
import { icons } from "app/icons";
import { LocationService } from "app/misc-services/location.service";
import { Climacell } from "app/sources/climacell/climacell";
import { WeatherGov } from "app/sources/weather-gov/weather-gov";
import { WeatherUnlocked } from "app/sources/weather-unlocked/weather-unlocked";
import { SourceId } from "app/state/source";
import { WeatherStore } from "app/state/weather-store";
import { HttpStatusService } from "app/to-replace/http-status.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends DirectiveSuperclass {
  title$: Observable<string>;
  @ViewChild("sidenav", { read: MatSidenav }) private sidenav!: MatSidenav;

  constructor(
    climacell: Climacell,
    domSanitizer: DomSanitizer,
    public httpStatusService: HttpStatusService,
    injector: Injector,
    private locationService: LocationService,
    matIconRegistry: MatIconRegistry,
    private store: WeatherStore,
    weatherGov: WeatherGov,
    weatherUnlocked: WeatherUnlocked,
  ) {
    super(injector);
    this.title$ = locationService.$.pipe(
      map((location) => location.city || "Weather Graph"),
    );

    climacell.initialize();
    weatherGov.initialize(SourceId.WEATHER_UNLOCKED);
    weatherUnlocked.initialize();
    matIconRegistry.addSvgIconSetLiteral(
      domSanitizer.bypassSecurityTrustHtml(icons),
    );

    this.openSideNavWhenAsked();
  }

  setRange(days: number) {
    this.store.dispatch(new SetRangeAction(days));
  }

  private openSideNavWhenAsked() {
    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.sidenav.open();
    });
  }
}
