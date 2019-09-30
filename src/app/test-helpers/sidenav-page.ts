import { byLabel } from "@ngneat/spectator";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";

export class SidenavPage {
  constructor(private ctx: WeatherGraphContext) {}

  el() {
    return this.ctx.spectator.query<HTMLElement>("mat-sidenav")!;
  }

  currentRadio() {
    return this.ctx.spectator.query<HTMLInputElement>(byLabel("Current"))!;
  }

  customRadio() {
    return this.ctx.spectator.query<HTMLInputElement>(byLabel("Custom"))!;
  }
}
