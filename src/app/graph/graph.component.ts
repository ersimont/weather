import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, Injector } from "@angular/core";
import {
  ChartData,
  ChartDataSets,
  ChartOptions,
  ChartPoint,
  ChartTooltipItem,
} from "chart.js";
import "chartjs-plugin-zoom";
import { bindKey, flatten, keys, map as _map } from "micro-dash";
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
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  chartOptions = this.getChartOptions();
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(
    private demicalPipe: DecimalPipe,
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

  getTooltipLabel(tooltipItem: ChartTooltipItem, data: ChartData) {
    const label = data.datasets![tooltipItem.datasetIndex!].label!;
    const value = this.demicalPipe.transform(tooltipItem.value, ".1-1");
    return `${label}: ${value}`;
  }

  private setRange({ days }: SetRangeAction) {
    this.themeService.setColorschemesOptions({
      scales: { xAxes: [{ time: getXAxisRange(days) }] },
    });
  }

  private getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      legend: { display: false },
      tooltips: { callbacks: { label: bindKey(this, "getTooltipLabel") } },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              ...getXAxisRange(1),
              displayFormats: { day: "ddd" },
              tooltipFormat: "dddd h a",
            },
            ticks: { major: { enabled: true } },
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
      plugins: {
        zoom: {
          pan: { enabled: true, mode: "x" },
          zoom: { enabled: true, mode: "x" },
        },
      },
    };
  }
}

function getXAxisRange(days: number) {
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
