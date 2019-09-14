import { Component } from "@angular/core";
import { WeatherGov } from "./clients/weather-gov";
import { map, startWith, switchMap } from "rxjs/operators";
import { GpsCoordsService } from "./gps-coords.service";
import { get, times } from "micro-dash";
import { Observable } from "rxjs";
import { DatePipe } from "@angular/common";
import { ChartDataSets, ChartOptions } from "chart.js";
import { Conditions, Forecast } from "./clients/abstract-client";
import { cache } from "s-rxjs-utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [DatePipe],
})
export class AppComponent {
  labels: Array<string>;
  chartOptions$: Observable<ChartOptions>;
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(
    datePipe: DatePipe,
    gpsCoordsService: GpsCoordsService,
    weatherGov: WeatherGov,
  ) {
    const thisHour = new Date().setMinutes(0, 0, 0);
    const timestamps = times(24, (i) => thisHour + i * 3600000);
    const forecast$ = gpsCoordsService.$.pipe(
      switchMap((gpsCoords) => weatherGov.fetch(gpsCoords)),
      startWith({ city: "loading..." }),
      cache(),
    );

    this.labels = timestamps.map((t) => datePipe.transform(t, "h a"));
    this.chartOptions$ = forecast$.pipe(map(getChartOptions));
    this.dataSets$ = forecast$.pipe(
      map((forecast) => getDataSets(timestamps, forecast)),
    );
  }
}

function getChartOptions(forecast): ChartOptions {
  return {
    title: { display: true, text: `Hourly Forecast: ${forecast.city}` },
    elements: { line: { fill: false } },
    spanGaps: true,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [
        { position: "left", id: "dynamic", ticks: { beginAtZero: true } },
        {
          position: "right",
          id: "percentage",
          ticks: { min: 0, max: 100 },
        },
      ],
    },
  };
}

function getDataSets(
  timestamps: number[],
  forecast: Forecast,
): ChartDataSets[] {
  return [
    {
      label: "Temperature",
      data: extractCondition(timestamps, forecast, "temperature"),
      yAxisID: "dynamic",
    },
    {
      label: "Apparent Temperature",
      data: extractCondition(timestamps, forecast, "apparentTemperature"),
      yAxisID: "dynamic",
    },
    {
      label: "Dew Point",
      data: extractCondition(timestamps, forecast, "dewPoint"),
      yAxisID: "dynamic",
    },
    {
      label: "Wind Speed",
      data: extractCondition(timestamps, forecast, "windSpeed"),
      yAxisID: "dynamic",
    },
    {
      label: "Chance of Precipitation",
      data: extractCondition(timestamps, forecast, "chanceOfPrecipitation"),
      yAxisID: "percentage",
      fill: true,
    },
    {
      label: "Amount of Precipitation",
      data: extractCondition(timestamps, forecast, "amountOfPrecipitation"),
      yAxisID: "percentage",
    },
  ];
}

function extractCondition(
  timestamps: number[],
  forecast: Forecast,
  key: keyof Conditions,
) {
  return timestamps.map((t) => get(forecast, [t, key]));
}
