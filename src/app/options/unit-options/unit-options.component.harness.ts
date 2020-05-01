import { AppComponentHarness } from "app/app.component.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class UnitOptionsComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super();
  }

  select(unitLabel: string) {
    this.ensureExpanded();
    this.ctx.click(this.getButton(unitLabel));
  }

  ensureExpanded() {
    new AppComponentHarness(this.ctx).ensureSidenavExpanded();
    if (!this.isExpanded()) {
      this.ctx.click(this.getHeader());
    }
  }

  isExpanded() {
    return this.getHeader().classList.contains("mat-expanded");
  }

  getHeader() {
    return this.get<HTMLElement>("mat-expansion-panel-header");
  }

  getButton(text: string) {
    return this.get<HTMLButtonElement>("button", { text });
  }

  protected getHost() {
    return this.get("app-unit-options", { parent: this.ctx.rootElement });
  }
}
