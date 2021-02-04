import { Condition, conditionInfo } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherState } from 'app/state/weather-state';
import { ChartDataSets, ChartPoint, PointStyle } from 'chart.js';
import { forEach, keys } from '@s-libs/micro-dash';

const pointStyles: { [id in SourceId]: PointStyle } = {
  [SourceId.CLIMACELL]: 'rect',
  [SourceId.OPEN_WEATHER]: 'rectRot',
  [SourceId.WEATHER_GOV]: 'circle',
  [SourceId.WEATHER_UNLOCKED]: 'triangle',
};

const radii: { [id in SourceId]: number } = {
  [SourceId.CLIMACELL]: 5,
  [SourceId.OPEN_WEATHER]: 5,
  [SourceId.WEATHER_GOV]: 4,
  [SourceId.WEATHER_UNLOCKED]: 6,
};

export function buildDatasets(state: WeatherState): Chart.ChartDataSets[] {
  const dataSets: ChartDataSets[] = [];
  forEach(state.sources, (_, sourceId) => {
    addDataSets(sourceId, dataSets, state);
  });
  return dataSets;
}

function addDataSets(
  sourceId: SourceId,
  dataSets: ChartDataSets[],
  state: WeatherState,
): void {
  // the first ones added will be displayed on top of later ones
  addDataSet(sourceId, dataSets, state, Condition.TEMP, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.FEEL, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.DEW, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.WIND, 'dynamic');
  addDataSet(
    sourceId,
    dataSets,
    state,
    Condition.AMOUNT,
    state.units.amount === AmountUnit.IN ? 'inches' : 'millimeters',
    '60',
  );
  addDataSet(sourceId, dataSets, state, Condition.CLOUD, 'percentage', '20');
}

function addDataSet(
  sourceId: SourceId,
  dataSets: ChartDataSets[],
  state: WeatherState,
  condition: Condition,
  yAxisID: string,
  fillAlpha = '00',
): void {
  const color = conditionInfo[condition].getColor();
  dataSets.push({
    label: encodeLabelValues(sourceId, condition),
    data: getData(sourceId, condition, state),
    yAxisID,
    borderColor: color,
    backgroundColor: color + fillAlpha,
    pointBackgroundColor: color,
    pointHoverBorderColor: color,
    pointHoverBackgroundColor: color,
    pointStyle: pointStyles[sourceId],
    radius: radii[sourceId],
    pointHitRadius: 25,
  });
}

function getData(
  sourceId: SourceId,
  condition: Condition,
  state: WeatherState,
): Chart.ChartPoint[] {
  const data: ChartPoint[] = [];
  const source = state.sources[sourceId];
  const unitInf = conditionInfo[condition].getUnitInfo(state.units);
  if (source.show && state.showConditions[condition]) {
    for (const time of keys(source.forecast).sort()) {
      const value = source.forecast[time as any][condition];
      if (value !== undefined) {
        data.push({ t: +time, y: unitInf.convert(value) });
      }
    }
  }
  return data;
}

interface LabelIds {
  sourceId: SourceId;
  condition: Condition;
}

function encodeLabelValues(sourceId: SourceId, condition: Condition): string {
  return JSON.stringify({ sourceId, condition });
}

export function decodeLabelValues(
  item: Chart.ChartTooltipItem,
  data: Chart.ChartData,
): LabelIds {
  return JSON.parse(data.datasets![item.datasetIndex!].label!);
}
