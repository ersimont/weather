import { ChangeDetectionStrategy, Component, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { ChartDataSets, ChartOptions, ChartPoint } from "chart.js";
import { flatten, keys, map as _map } from "micro-dash";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";
import { WeatherStore } from "../state/weather-store";
import { Condition, conditionDisplays } from "../state/condition";
import { Source } from "../state/source";

import "chartjs-plugin-zoom";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  chartOptions = getChartOptions();
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(injector: Injector, store: WeatherStore) {
    super(injector);

    this.dataSets$ = store.$.pipe(
      map((state) =>
        flatten(
          _map(state.sources, (source) =>
            getDataSets(state.showConditions, source),
          ),
        ),
      ),
    );
  }
}

function getChartOptions(): ChartOptions {
  const thisHour = new Date();
  thisHour.setMinutes(0, 0, 0);
  const nextDay = new Date(thisHour.getTime());
  nextDay.setDate(thisHour.getDate() + 1);
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    legend: { display: false },
    scales: {
      xAxes: [
        {
          type: "time",
          time: { min: thisHour.toISOString(), max: nextDay.toISOString() },
        },
      ],
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
    plugins: {
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: { enabled: true, mode: "x" },
      },
    },
  };
}

function getDataSets(
  showConditions: Record<Condition, boolean>,
  source: Source,
): ChartDataSets[] {
  return _map(conditionDisplays, (dataSet, condition) => {
    const data: ChartPoint[] = [];
    if (source.show && showConditions[condition]) {
      for (const time of keys(source.forecast).sort()) {
        const value = source.forecast[time as any][condition];
        if (value !== undefined) {
          data.push({ t: +time, y: value });
        }
      }
    }
    return { ...dataSet, data };
  });
}
