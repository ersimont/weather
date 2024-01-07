import { getDefaultChartOptions } from 'app/graph/chartjs-options';
import { ChartDataset, ChartOptions } from 'chart.js';
import { DeepRequired } from 'utility-types';

export class GraphState {
  options = getDefaultChartOptions() as DeepRequired<ChartOptions<'line'>>;
  data: ChartDataset<'line'>[] = [];
}
