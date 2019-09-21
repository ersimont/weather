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
import { bindKey, find, flatten, keys, map as _map, matches } from "micro-dash";
import { ThemeService } from "ng2-charts";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DirectiveSuperclass } from "s-ng-utils";
import { Condition, conditionInfo } from "../state/condition";
import { Source } from "../state/source";
import { WeatherState } from "../state/weather-state";
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
    private store: WeatherStore,
    private themeService: ThemeService,
    injector: Injector,
  ) {
    super(injector);

    this.dataSets$ = store.$.pipe(
      map((state) =>
        flatten(_map(state.sources, (source) => getDataSets(state, source))),
      ),
    );

    this.subscribeTo(store.action$.pipe(SetRangeAction.filter), this.setRange);
  }

  getTooltipLabel(tooltipItem: ChartTooltipItem, data: ChartData) {
    const label = data.datasets![tooltipItem.datasetIndex!].label!;
    const value = this.demicalPipe.transform(tooltipItem.value, ".1-1");
    const suffix = find(conditionInfo, matches({ label }))!.getSuffix(
      this.store.state().units,
    );
    return `${label}: ${value}${suffix}`;
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
              tooltipFormat: "dddd h:mm a",
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

function getDataSets(state: WeatherState, source: Source): ChartDataSets[] {
  return _map(conditionDisplays, (dataSet, condition) => {
    const data: ChartPoint[] = [];
    if (source.show && state.showConditions[condition]) {
      for (const time of keys(source.forecast).sort()) {
        const value = source.forecast[time as any][condition];
        if (value !== undefined) {
          data.push({
            t: +time,
            y: conditionInfo[condition].convert(value, state.units),
          });
        }
      }
    }
    return { ...dataSet, data };
  });
}

const conditionDisplays = {} as Record<Condition, ChartDataSets>;
addDataSet(Condition.TEMP, "dynamic");
addDataSet(Condition.FEEL, "dynamic");
addDataSet(Condition.DEW, "dynamic");
addDataSet(Condition.WIND, "dynamic");
addDataSet(Condition.CHANCE, "percentage", "20");
addDataSet(Condition.AMOUNT, "percentage", "60");

function addDataSet(
  condition: Condition,
  yAxisID: "dynamic" | "percentage",
  fillAlpha = "00",
) {
  const info = conditionInfo[condition];
  const color = info.color;
  conditionDisplays[condition] = {
    label: info.label,
    yAxisID,
    borderColor: color,
    backgroundColor: color + fillAlpha,
    pointBackgroundColor: color,
    pointHitRadius: 25,
  };
}
