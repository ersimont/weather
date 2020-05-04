import { AppComponentHarness } from "app/app.component.harness";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { AbstractComponentHarness } from "app/to-replace/test-context/abstract-component-harness";

export class LocationOptionsComponentHarness extends AbstractComponentHarness {
  constructor(private ctx: WeatherGraphContext) {
    super();
  }

  setCustomLocation(search: string) {
    this.ensureExpanded();
    const customInput = this.getCustomInput();
    this.ctx.setText(search, customInput);
    this.ctx.dispatchChange(customInput);
  }

  select(label: string) {
    this.ensureExpanded();
    this.ctx.click(this.getRadioLabel(label));
  }

  ensureExpanded() {
    new AppComponentHarness(this.ctx).ensureSidenavExpanded();
    // TODO: see if harnesses can be adapted to fakeAsync
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

  getCustomInput() {
    return this.get<HTMLInputElement>("mat-form-field input");
  }

  protected getHost() {
    return this.get("app-location-options", {
      parent: this.ctx.rootElement,
    });
  }
}
