import { ChangeDetectionStrategy, Component } from "@angular/core";
import { WeatherGov } from "./sources/weather-gov";
import { WeatherUnlocked } from "./sources/weather-unlocked";
import { RefreshService } from "./refresh.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    private refreshService: RefreshService,
    private weatherGov: WeatherGov,
    private weatherUnlocked: WeatherUnlocked,
  ) {
    this.initializeSources();
  }

  private async initializeSources() {
    await this.refreshService.refresh();
    this.weatherGov.initialize();
    this.weatherUnlocked.initialize();
  }
}
