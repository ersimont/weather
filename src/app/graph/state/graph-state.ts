import { defaultChartOptions } from 'app/graph/chartjs-options';
import { ChartDataset, ChartOptions } from 'chart.js';
import { DeepRequired } from 'utility-types';

export class GraphState {
  options = defaultChartOptions as DeepRequired<ChartOptions<'line'>>;
  data: ChartDataset<'line'>[] = [];
}
