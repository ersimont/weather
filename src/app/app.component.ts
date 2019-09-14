import { Component } from "@angular/core";
import { WeatherGov } from "./clients/weather-gov";
import { map, startWith } from "rxjs/operators";
import { GpsCoordsService } from "./gps-coords.service";
import { times } from "micro-dash";
import { combineLatest, Observable } from "rxjs";
import { DatePipe } from "@angular/common";
import { ChartDataSets, ChartOptions } from "chart.js";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [DatePipe],
})
export class AppComponent {
  labels$: Observable<Array<string>>;
  dataSets$: Observable<Array<ChartDataSets>>;
  chartOptions$: Observable<ChartOptions>;

  constructor(
    public weatherGov: WeatherGov,
    datePipe: DatePipe,
    gpsCoordsService: GpsCoordsService,
  ) {
    this.chartOptions$ = weatherGov.city$.pipe(
      map(
        (city): ChartOptions => ({
          title: { display: true, text: `${city} Hourly Forecast` },
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
        }),
      ),
    );

    const dates$ = gpsCoordsService.$.pipe(
      startWith(undefined),
      map(() => {
        const thisHour = new Date().setMinutes(0, 0, 0);
        return times(24, (i) => thisHour + i * 3600000);
      }),
    );
    this.labels$ = dates$.pipe(
      map((dates) => dates.map((date) => datePipe.transform(date, "h a"))),
    );
    this.dataSets$ = combineLatest(
      dates$,
      weatherGov.temperature$,
      // weatherGov.apparentTemperature$,
      weatherGov.dewPoint$,
      weatherGov.chanceOfPrecipitation$,
      weatherGov.amountOfPrecipitation$,
      weatherGov.windSpeed$,
    ).pipe(
      map(
        ([
          dates,
          temperature, // apparentTemperature,
          dewPoints,
          chancesOfPrecipitation,
          amountOfPrecipitation,
          windSpeed,
        ]): ChartDataSets[] => [
          {
            label: "Temperature",
            data: dates.map((date) => temperature[date]),
            yAxisID: "dynamic",
          },
          // {
          //   label: "Apparent Temperature",
          //   data: dates.map((date) => apparentTemperature[date]),
          //   yAxisID: "temp",
          // },
          {
            label: "Dew Point",
            data: dates.map((date) => dewPoints[date]),
            yAxisID: "dynamic",
          },
          {
            label: "Wind Speed",
            data: dates.map((date) => windSpeed[date]),
            yAxisID: "dynamic",
          },
          {
            label: "Chance of Precipitation",
            data: dates.map((date) => chancesOfPrecipitation[date]),
            yAxisID: "percentage",
            fill: true,
          },
          {
            label: "Amount of Precipitation",
            data: dates.map((date) => amountOfPrecipitation[date]),
            yAxisID: "percentage",
          },
        ],
      ),
    );
  }
}
