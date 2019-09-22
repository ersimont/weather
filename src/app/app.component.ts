import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { SetRangeAction } from "./graph/set-range-action";
import { RefreshService } from "./refresh.service";
import { WeatherStore } from "./state/weather-store";

const icons = `
  <svg><defs>
    <svg id="day">
      <path
        d="M 2 12 q 5 -20 10 0 t 10 0"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <svg id="three-days">
      <path
        d="M 1.5 12 q 1.75 -20 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    <svg id="week">
      <path
        d="M 1.5 12 q .75 -20 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  </defs></svg>
`;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    private store: WeatherStore,
    domSanitizer: DomSanitizer,
    matIconRegistry: MatIconRegistry,
    refreshService: RefreshService,
  ) {
    refreshService.start();
    matIconRegistry.addSvgIconSetLiteral(
      domSanitizer.bypassSecurityTrustHtml(icons),
    );
  }

  setRange(days: number) {
    this.store.dispatch(new SetRangeAction(days));
  }
}
