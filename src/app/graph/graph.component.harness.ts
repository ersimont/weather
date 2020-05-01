import { By } from "@angular/platform-browser";
import { GraphComponent } from "app/graph/graph.component";
import { Condition } from "app/state/condition";
import { SourceId } from "app/state/source";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { ChartPoint, ChartTooltipItem } from "chart.js";
import { take } from "rxjs/operators";

const sourceOrder = [SourceId.WEATHER_GOV, SourceId.WEATHER_UNLOCKED];
const conditionOrder = [
  Condition.TEMP,
  Condition.FEEL,
  Condition.DEW,
  Condition.WIND,
  Condition.AMOUNT,
  Condition.CLOUD,
];

export class GraphComponentHarness {
  constructor(private ctx: WeatherGraphContext) {}

  showsData() {
    return this.getDataSets().some((dataSet) => dataSet.data?.length);
  }

  getTooltipLabel(
    sourceId: SourceId.WEATHER_UNLOCKED,
    condition: Condition.TEMP,
    index: number,
  ) {
    const chartOptions = this.getComponent().chartOptions;
    const datasets = this.getDataSets();

    const datasetIndex =
      conditionOrder.length * sourceOrder.indexOf(sourceId) +
      conditionOrder.indexOf(condition);
    const chartPoints = datasets[datasetIndex].data as ChartPoint[];
    const value = chartPoints[index].y!.toString();
    const item: ChartTooltipItem = { value, datasetIndex, index };
    const getLabel = chartOptions.tooltips!.callbacks!.label!;
    return getLabel(item, { datasets });
  }

  getTooltipFooter(sourceId: SourceId) {
    const chartOptions = this.getComponent().chartOptions;
    const datasets = this.getDataSets();

    const datasetIndex = conditionOrder.length * sourceOrder.indexOf(sourceId);
    const getFooter = chartOptions.tooltips!.callbacks!.footer!;
    return getFooter([{ datasetIndex }], { datasets });
  }

  private getDataSets() {
    let dataSets: Chart.ChartDataSets[];
    this.getComponent()
      .dataSets$.pipe(take(1))
      .subscribe((ds) => {
        dataSets = ds;
      });
    return dataSets!;
  }

  private getComponent(): GraphComponent {
    return this.ctx.debugElement.query(By.directive(GraphComponent)).context;
  }
}
