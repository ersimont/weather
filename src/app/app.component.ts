import { Component } from "@angular/core";
import { WeatherGov } from "./clients/weather-gov";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  constructor(public weatherGov: WeatherGov) {}
}
