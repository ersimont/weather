import { forEach, keys } from '@s-libs/micro-dash';
import { Condition, conditionInfo } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherState } from 'app/state/weather-state';
import {
  ChartDataset,
  DefaultDataPoint,
  PointStyle,
  TooltipItem,
} from 'chart.js';

const pointStyles: { [id in SourceId]: PointStyle } = {
  [SourceId.OPEN_WEATHER]: 'rectRot',
  [SourceId.VISUAL_CROSSING]: 'crossRot',
  [SourceId.WEATHER_GOV]: 'circle',
  [SourceId.WEATHER_UNLOCKED]: 'triangle',
};

const radii: { [id in SourceId]: number } = {
  [SourceId.OPEN_WEATHER]: 5,
  [SourceId.VISUAL_CROSSING]: 7,
  [SourceId.WEATHER_GOV]: 4,
  [SourceId.WEATHER_UNLOCKED]: 6,
};

export function buildDatasets(
  state: WeatherState,
  colors: Record<Condition, string>,
): ChartDataset<'line'>[] {
  const dataSets: ChartDataset<'line'>[] = [];
  forEach(state.sources, (_, sourceId) => {
    addDatasets(sourceId, dataSets, state, colors);
  });
  return dataSets;
}

function addDatasets(
  sourceId: SourceId,
  datasets: ChartDataset<'line'>[],
  state: WeatherState,
  colors: Record<Condition, string>,
): void {
  // the first ones added will be displayed on top of later ones
  addDataset(sourceId, datasets, state, colors, Condition.TEMP, 'dynamic');
  addDataset(sourceId, datasets, state, colors, Condition.FEEL, 'dynamic');
  addDataset(sourceId, datasets, state, colors, Condition.DEW, 'dynamic');
  addDataset(sourceId, datasets, state, colors, Condition.WIND, 'dynamic');
  addDataset(
    sourceId,
    datasets,
    state,
    colors,
    Condition.AMOUNT,
    state.units.amount === AmountUnit.IN ? 'inches' : 'millimeters',
    '60',
  );
  addDataset(
    sourceId,
    datasets,
    state,
    colors,
    Condition.CLOUD,
    'percentage',
    '20',
  );
}

function addDataset(
  sourceId: SourceId,
  datasets: ChartDataset<'line'>[],
  state: WeatherState,
  colors: Record<Condition, string>,
  condition: Condition,
  yAxisID: string,
  fillAlpha = '00',
): void {
  const color = colors[condition];
  datasets.push({
    label: encodeLabelValues(sourceId, condition),
    data: getData(sourceId, condition, state),
    yAxisID,
    borderColor: color,
    backgroundColor: color + fillAlpha,
    pointBackgroundColor: color,
    pointHoverBorderColor: color,
    pointHoverBackgroundColor: color,
    pointStyle: pointStyles[sourceId],
    pointRadius: radii[sourceId],
    tension: 0.3,
    pointHitRadius: 25,
    fill: { target: 'origin' },
  });
}

function getData(
  sourceId: SourceId,
  condition: Condition,
  state: WeatherState,
): DefaultDataPoint<'line'> {
  const data: DefaultDataPoint<'line'> = [];
  const source = state.sources[sourceId];
  const unitInf = conditionInfo[condition].getUnitInfo(state.units);
  if (source.show && state.showConditions[condition]) {
    for (const time of keys(source.forecast).sort()) {
      const value = source.forecast[time as any][condition];
      if (value !== undefined) {
        data.push({ x: +time, y: unitInf.convert(value) });
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

export function decodeLabelValues(item: TooltipItem<'line'>): LabelIds {
  return JSON.parse(item.dataset.label!);
}
