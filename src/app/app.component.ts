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
import { LocationService } from "app/services/location.service";
import { WeatherGov } from "app/sources/weather-gov";
import { WeatherUnlocked } from "app/sources/weather-unlocked";
import { SourceId } from "app/state/source";
import { WeatherStore } from "app/state/weather-store";
import { HttpStatusService } from "app/to-replace/http-status.service";
import { ofType } from "app/to-replace/of-type";
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
    public httpStatusService: HttpStatusService,
    private store: WeatherStore,
    domSanitizer: DomSanitizer,
    injector: Injector,
    locationService: LocationService,
    matIconRegistry: MatIconRegistry,
    weatherGov: WeatherGov,
    weatherUnlocked: WeatherUnlocked,
  ) {
    super(injector);
    this.title$ = locationService.$.pipe(
      map((location) => location.city || "Weather Graph"),
    );

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
    this.subscribeTo(
      this.store.action$.pipe(ofType("ask_for_location")),
      () => {
        this.sidenav.open();
      },
    );
  }
}
