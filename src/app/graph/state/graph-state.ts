import { getDefaultChartOptions } from 'app/graph/chartjs-options';
import { ChartDataset } from 'chart.js';

export class GraphState {
  options = getDefaultChartOptions();
  data: Array<ChartDataset<'line'>> = [];
}
