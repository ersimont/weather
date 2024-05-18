import { convertTime } from '@s-libs/js-core';
import { cloneDeep } from '@s-libs/micro-dash';
import { GpsCoords } from 'app/state/location';
import { AmountUnit, unitInfo } from 'app/state/units';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { getTimes, GetTimesResult } from 'suncalc';

const grid = { color: 'rgba(0, 0, 0, 0.05)' };

const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      type: 'time',
      grid,
      time: {
        displayFormats: { day: 'EEEE' },
        tooltipFormat: 'EEEE h:mm a',
        minUnit: 'hour',
      },
      ticks: { major: { enabled: true }, font: { weight: 'bold' } },
      adapters: { date: {} },
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
    annotation: {},
    tooltip: { footerFont: { style: 'italic' }, callbacks: {} },
    zoom: {
      pan: { enabled: true, mode: 'x' },
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
      limits: { x: {} },
    },
  },
};

/**
 * Something messed with things inside the options object to make part of it return `false` for `instanceof Object` in tests - only if it's not the first test. Perhaps something in a date adapter? That's one place that was affected. It caused a test failure that was VERY hard to track down.
 *
 * This ensures every test run starts with a fresh copy of the options.
 */
export function getDefaultChartOptions(): ChartOptions<'line'> {
  return cloneDeep(defaultChartOptions);
}

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
    drawTime: 'beforeDatasetsDraw',
  }));
}

export function buildNowLine(now: number): AnnotationOptions<'line'> {
  return {
    type: 'line',
    xMin: now,
    xMax: now,
    borderColor: 'indianred',
    drawTime: 'beforeDatasetsDraw',
  };
}

export function getMinMax(now: number): { min: number; max: number } {
  const oneDay = convertTime(1, 'd', 'ms');
  return { min: now - oneDay, max: now + 8 * oneDay };
}
