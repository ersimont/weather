import { Component } from "@angular/core";
import { WeatherGov } from "./clients/weather-gov";
import { map, startWith } from "rxjs/operators";
import { GpsCoordsService } from "./gps-coords.service";
import { times } from "micro-dash";
import { combineLatest, Observable } from "rxjs";
import { DatePipe } from "@angular/common";
import { ChartDataSets } from "chart.js";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [DatePipe],
})
export class AppComponent {
  labels$: Observable<Array<string>>;
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(
    public weatherGov: WeatherGov,
    datePipe: DatePipe,
    gpsCoordsService: GpsCoordsService,
  ) {
    const dates$ = gpsCoordsService.$.pipe(
      startWith(undefined),
      map(() => {
        const thisHour = new Date().setMinutes(0, 0, 0);
        return times(24, (i) => thisHour + (i - 3) * 3600000);
      }),
    );
    this.labels$ = dates$.pipe(
      map((dates) => dates.map((date) => datePipe.transform(date, "h a"))),
    );
    this.dataSets$ = combineLatest(dates$, weatherGov.apparentTemp$).pipe(
      map(([dates, temps]) => [
        {
          label: "Apparent Temp",
          data: dates.map((date) => temps[date]),
          spanGaps: true,
        },
      ]),
    );
  }
}
