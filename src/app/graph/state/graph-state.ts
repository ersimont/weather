import { defaultChartOptions } from 'app/graph/chartjs-options';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { DeepRequired } from 'utility-types';

export class GraphState {
  options = defaultChartOptions as DeepRequired<ChartOptions>;
  data: ChartDataSets[] = [];
}
