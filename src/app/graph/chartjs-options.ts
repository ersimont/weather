import { convertTime } from '@s-libs/js-core';
import { GpsCoords } from 'app/state/location';
import { AmountUnit, unitInfo } from 'app/state/units';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { getTimes, GetTimesResult } from 'suncalc';

const grid = { color: 'rgba(0, 0, 0, 0.05)' };

export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    x: {
      type: 'time',
      grid,
      time: {
        displayFormats: { day: 'dddd' },
        tooltipFormat: 'dddd h:mm a',
        minUnit: 'hour',
      },
      ticks: { major: { enabled: true }, font: { weight: 'bold' } },
    },
    dynamic: { position: 'left', grid, beginAtZero: true },
    percentage: { position: 'right', grid, min: 0, max: 100 },
    inches: {
      display: false,
      position: 'left',
      min: 0,
      max: unitInfo[AmountUnit.IN].convert(10),
    },
    millimeters: { display: false, position: 'left', min: 0, max: 10 },
  },
  plugins: {
    annotation: { drawTime: 'beforeDatasetsDraw' },
    tooltip: { footerFont: { style: 'italic' }, callbacks: {} },
    zoom: {
      pan: { enabled: true, mode: 'x' },
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
      limits: { x: {} },
    },
  },
};

export function buildNightBoxes(
  now: number,
  gpsCoords: GpsCoords,
): AnnotationOptions[] {
  const sunTimes: GetTimesResult[] = [];
  const { min, max } = getMinMax(now);
  const oneDay = convertTime(1, 'd', 'ms');
  for (let time = min - oneDay; time < max + oneDay; time += oneDay) {
    sunTimes.push(getTimes(new Date(time), ...gpsCoords));
  }
  return sunTimes.slice(0, -1).map(({ sunset }, i) => ({
    type: 'box',
    xMin: +sunset,
    xMax: +sunTimes[i + 1].sunrise,
    borderWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  }));
}

export function buildNowLine(now: number): AnnotationOptions<'line'> {
  return { type: 'line', xMin: now, xMax: now, borderColor: 'indianred' };
}

export function getMinMax(now: number): { min: number; max: number } {
  const oneDay = convertTime(1, 'd', 'ms');
  return { min: now - oneDay, max: now + 8 * oneDay };
}
