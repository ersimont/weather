import { By } from '@angular/platform-browser';
import { GraphComponent } from 'app/graph/graph.component';
import { GraphStore } from 'app/graph/state/graph-store';
import { Condition } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import {
  ChartDataset,
  ChartOptions,
  ScatterDataPoint,
  TimeScaleOptions,
  TooltipItem,
} from 'chart.js';
import { DeepRequired } from 'utility-types';

const sourceOrder = [
  SourceId.OPEN_WEATHER,
  SourceId.TOMORROW_IO,
  SourceId.VISUAL_CROSSING,
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

  showsData(): boolean {
    return this.getDataSets().some((dataSet) => dataSet.data?.length);
  }

  getTooltipLabel(
    sourceId: SourceId,
    condition: Condition,
    index: number,
  ): string {
    const getLabel = this.getOptions().plugins.tooltip.callbacks.label as (
      item: TooltipItem<'line'>,
    ) => string;
    return getLabel(this.getTooltipItem(sourceId, condition, index));
  }

  getTooltipFooter(sourceId: SourceId): string {
    const getFooter = this.getOptions().plugins.tooltip.callbacks.footer as (
      items: TooltipItem<'line'>[],
    ) => string;
    return getFooter([
      this.getTooltipItem(sourceId, Condition.TEMP, 0),
    ]) as string;
  }

  getTimeZone(): string | undefined {
    const scale = this.getOptions().scales['x'] as TimeScaleOptions;
    const date: any = scale.adapters.date;
    return date.zone;
  }

  private getOptions(): DeepRequired<ChartOptions<'line'>> {
    return this.getGraphStore().state().options;
  }

  private getTooltipItem(
    sourceId: SourceId,
    condition: Condition,
    index: number,
  ): TooltipItem<'line'> {
    // construct just the parts that our code actually uses
    const datasetIndex =
      conditionOrder.length * sourceOrder.indexOf(sourceId) +
      conditionOrder.indexOf(condition);
    const dataset = this.getDataSets()[datasetIndex];
    const chartPoints = dataset.data as ScatterDataPoint[];
    const value = chartPoints[index];
    return { parsed: value, dataset } as TooltipItem<'line'>;
  }

  private getDataSets(): ChartDataset<'line'>[] {
    return this.getGraphStore().state().data;
  }

  private getGraphStore(): GraphStore {
    return this.ctx.fixture.debugElement
      .query(By.directive(GraphComponent))
      .injector.get(GraphStore);
  }
}
