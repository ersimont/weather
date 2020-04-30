import { AppComponentHarness } from "app/app.component.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class SourceOptionsComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super();
  }

  toggle(label: string) {
    this.ensureExpanded();
    this.ctx.click(this.getToggleLabel(label));
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

  getToggleLabel(text: string) {
    return this.get<HTMLElement>("label", { text });
  }

  protected getHost() {
    return this.get("app-source-options", {
      parent: this.ctx.rootElement,
    });
  }
}
