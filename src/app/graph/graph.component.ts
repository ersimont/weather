import { Component, Injector, Input } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { ChartDataSets, ChartOptions } from "chart.js";
import { DatePipe } from "@angular/common";
import { GpsCoordsService } from "../gps-coords.service";
import { WeatherGov } from "../sources/weather-gov";
import { WeatherUnlocked } from "../sources/weather-unlocked";
import { flatten, get, times } from "micro-dash";
import { map } from "rxjs/operators";
import { Conditions, Forecast } from "../sources/abstract-source";
import { DirectiveSuperclass } from "s-ng-utils";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.css"],
  providers: [DatePipe],
})
export class GraphComponent extends DirectiveSuperclass {
  labels: Array<string>;
  chartOptions = getChartOptions();
  dataSets$: Observable<Array<ChartDataSets>>;

  @Input() showWeatherGov = true;
  @Input() showWeatherUnlocked = false;

  constructor(
    datePipe: DatePipe,
    injector: Injector,
    weatherGov: WeatherGov,
    weatherUnlocked: WeatherUnlocked,
  ) {
    super(injector);

    const thisHour = new Date().setMinutes(0, 0, 0);
    const timestamps = times(24, (i) => thisHour + i * 3600000);
    this.labels = timestamps.map((t) => datePipe.transform(t, "h a")!);

    const weatherGovDataSets$ = combineLatest(
      weatherGov.forecast$,
      this.getInput$("showWeatherGov"),
    ).pipe(
      map(([forecast, show]) => getDataSets(timestamps, show ? forecast : {})),
    );
    const weatherUnlockedDataSets$ = combineLatest(
      weatherUnlocked.forecast$,
      this.getInput$("showWeatherUnlocked"),
    ).pipe(
      map(([forecast, show]) => getDataSets(timestamps, show ? forecast : {})),
    );
    this.dataSets$ = combineLatest(
      weatherGovDataSets$,
      weatherUnlockedDataSets$,
    ).pipe(map(flatten));
  }
}

function getChartOptions(): ChartOptions {
  return {
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
      label: "Temp",
      data: extractCondition(timestamps, forecast, "temperature"),
      yAxisID: "dynamic",
    },
    {
      label: "Apparent Temp",
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
      label: "Chance of Precip",
      data: extractCondition(timestamps, forecast, "chanceOfPrecipitation"),
      yAxisID: "percentage",
      fill: true,
    },
    {
      label: "Amount of Precip",
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
