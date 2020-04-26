import { AppComponentHarness } from "app/app.component.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class LocationOptionsComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super(ctx.spectator.hostElement, "app-location-options");
  }

  select(label: string) {
    this.ensureExpanded();
    this.ctx.click(this.getRadioLabel(label));
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

  getRadioLabel(text: string) {
    const container = this.get(".radio-container", { text });
    return this.get<HTMLElement>("mat-radio-button label", {
      parent: container,
    });
  }
}
