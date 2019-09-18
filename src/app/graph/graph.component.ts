import { ChangeDetectionStrategy, Component, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ChartDataSets, ChartOptions } from "chart.js";
import { DatePipe } from "@angular/common";
import { flatten, get, map as _map, times } from "micro-dash";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";
import { WeatherStore } from "../state/weather-store";
import { Condition, conditionDisplays } from "../state/condition";
import { Source } from "../state/source";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    this.dataSets$ = store.$.pipe(
      map((state) =>
        flatten(
          _map(state.sources, (source) =>
            getDataSets(timestamps, state.showConditions, source),
          ),
        ),
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
    spanGaps: true,
  };
}

function getDataSets(
  timestamps: number[],
  showConditions: Record<Condition, boolean>,
  source: Source,
): ChartDataSets[] {
  return _map(conditionDisplays, (dataSet, condition) => {
    let data: Array<number | undefined>;
    if (source.show && showConditions[condition]) {
      data = timestamps.map((t) => get(source.forecast[t], condition));
    } else {
      data = [];
    }
    return { ...dataSet, data };
  });
}
