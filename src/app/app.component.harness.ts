import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class AppComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super();
  }

  openPrivacyPolicy() {
    this.ensureSidenavExpanded();
    this.ctx.click(this.getPrivacyPolicyButton());
  }

  ensureSidenavExpanded() {
    if (!this.isSidenavExpanded()) {
      this.ctx.click(this.getMenuButton());
    }
  }

  isSidenavExpanded() {
    return this.getSidenav().classList.contains("mat-drawer-opened");
  }

  private getMenuButton() {
    return this.get<HTMLElement>("button", { text: "menu" });
  }

  private getPrivacyPolicyButton() {
    return this.get<HTMLButtonElement>("button", { text: "Privacy Policy" });
  }

  private getSidenav() {
    return this.get<HTMLElement>("mat-sidenav");
  }

  protected getHost() {
    return this.get("app-root", { parent: this.ctx.rootElement });
  }
}
