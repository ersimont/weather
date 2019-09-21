import { ChangeDetectionStrategy, Component, Injector } from "@angular/core";
import { ChartDataSets, ChartOptions, ChartPoint } from "chart.js";
import "chartjs-plugin-zoom";
import { flatten, keys, map as _map } from "micro-dash";
import { ThemeService } from "ng2-charts";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";
import { Condition, conditionDisplays } from "../state/condition";
import { Source } from "../state/source";
import { WeatherStore } from "../state/weather-store";
import { SetRangeAction } from "./set-range-action";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  chartOptions = getChartOptions();
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(
    private themeService: ThemeService,
    injector: Injector,
    store: WeatherStore,
  ) {
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

    this.subscribeTo(store.action$.pipe(SetRangeAction.filter), this.setRange);
  }

  private setRange({ days }: SetRangeAction) {
    this.themeService.setColorschemesOptions({
      scales: { xAxes: [{ time: getXAxisTime(days) }] },
    });
  }
}

function getChartOptions(): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    legend: { display: false },
    scales: {
      xAxes: [{ type: "time", time: getXAxisTime(1) }],
      yAxes: [
        { position: "left", id: "dynamic", ticks: { beginAtZero: true } },
        {
          position: "right",
          id: "percentage",
          ticks: { min: 0, max: 100 },
        },
      ],
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: { enabled: true, mode: "x" },
      },
    },
  };
}

function getXAxisTime(days: number) {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  const min = d.toISOString();

  d.setDate(d.getDate() + days);
  const max = d.toISOString();

  return { min, max };
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
