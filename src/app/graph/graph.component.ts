import { Component, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ChartDataSets, ChartOptions } from "chart.js";
import { DatePipe } from "@angular/common";
import { flatten, get, map as _map, times } from "micro-dash";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";
import { WeatherStore } from "../state/weather-store";
import { conditionDisplays } from "../state/condition";
import { Source } from "../state/source";

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

  constructor(datePipe: DatePipe, injector: Injector, store: WeatherStore) {
    super(injector);

    const thisHour = new Date().setMinutes(0, 0, 0);
    const timestamps = times(24, (i) => thisHour + i * 3600000);
    this.labels = timestamps.map((t) => datePipe.transform(t, "h a")!);

    this.dataSets$ = store("sources").$.pipe(
      map((sources) =>
        flatten(_map(sources, (source) => getDataSets(timestamps, source))),
      ),
    );
  }
}

function getChartOptions(): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    legend: { display: false },
    elements: { line: { fill: false } },
    spanGaps: true,
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

function getDataSets(timestamps: number[], source: Source): ChartDataSets[] {
  return _map(conditionDisplays, (dataSet, condition) => {
    let data: Array<number | undefined>;
    if (source.show && source.showMetric[condition]) {
      data = timestamps.map((t) => get(source.forecast[t], condition));
    } else {
      data = [];
    }
    return { ...dataSet, data };
  });
}
