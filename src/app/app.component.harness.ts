import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class AppComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super();
  }

  ensureSidenavExpanded() {
    if (!this.isSidenavExpanded()) {
      this.ctx.click(this.getMenuButton());
    }
  }

  isSidenavExpanded() {
    return this.getSidenav().classList.contains("mat-drawer-opened");
  }

  getMenuButton() {
    return this.get<HTMLElement>("button", { text: "menu" });
  }

  getSidenav() {
    return this.get<HTMLElement>("mat-sidenav");
  }

  protected getHost() {
    return this.get("app-root", { parent: this.ctx.rootElement });
  }
}
