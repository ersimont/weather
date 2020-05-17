import { GraphStore } from 'app/misc-components/graph/graph-store';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { ChartPoint, ChartTooltipItem } from 'chart.js';

const sourceOrder = [
  SourceId.CLIMACELL,
  SourceId.WEATHER_GOV,
  SourceId.WEATHER_UNLOCKED,
];
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

  getTooltipLabel(sourceId: SourceId, condition: Condition, index: number) {
    const datasetIndex =
      conditionOrder.length * sourceOrder.indexOf(sourceId) +
      conditionOrder.indexOf(condition);
    const chartPoints = this.getDataSets()[datasetIndex].data as ChartPoint[];
    const value = chartPoints[index].y!.toString();
    const item: ChartTooltipItem = { value, datasetIndex, index };
    const getLabel = this.getOptions().tooltips.callbacks.label;
    return getLabel(item, { datasets: this.getDataSets() });
  }

  getTooltipFooter(sourceId: SourceId) {
    const datasetIndex = conditionOrder.length * sourceOrder.indexOf(sourceId);
    const getFooter = this.getOptions().tooltips.callbacks.footer;
    return getFooter([{ datasetIndex }], { datasets: this.getDataSets() });
  }

  private getOptions() {
    return this.ctx.inject(GraphStore).state().options;
  }

  private getDataSets() {
    return this.ctx.inject(GraphStore).state().data;
  }
}
