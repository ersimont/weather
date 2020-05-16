import { GpsCoords } from 'app/state/location';
import { AmountUnit, unitInfo } from 'app/state/units';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { convertTime } from 's-js-utils';
import { getTimes, GetTimesResult } from 'suncalc';

const gridLines = { color: 'rgba(0, 0, 0, 0.05)' };

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  legend: { display: false },
  tooltips: { footerFontStyle: 'italic', callbacks: {} },
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          displayFormats: { day: 'dddd' },
          tooltipFormat: 'dddd h:mm a',
          minUnit: 'hour',
        },
        ticks: { major: { enabled: true, fontStyle: 'bold' } },
        gridLines,
      },
    ],
    yAxes: [
      {
        id: 'dynamic',
        position: 'left',
        gridLines,
        ticks: { beginAtZero: true },
      },
      {
        id: 'percentage',
        position: 'right',
        gridLines,
        ticks: { min: 0, max: 100 },
      },
      {
        id: 'inches',
        display: false,
        ticks: { min: 0, max: unitInfo[AmountUnit.IN].convert(10) },
      },
      { id: 'millimeters', display: false, ticks: { min: 0, max: 10 } },
    ],
  },
  plugins: {
    zoom: {
      pan: { enabled: true, mode: 'x' },
      zoom: { enabled: true, mode: 'x' },
    },
  },
};

// separate b/c the typing complains
(defaultChartOptions as any).annotation = { drawTime: 'beforeDatasetsDraw' };

export function buildMaxRange() {
  const min = midnight(-1);
  const max = midnight(8);
  return { rangeMin: { x: min }, rangeMax: { x: max } };
}

export function buildNightBoxes(
  min: number,
  max: number,
  gpsCoords: GpsCoords,
): AnnotationOptions[] {
  const sunTimes: GetTimesResult[] = [];
  const oneDay = convertTime(1, 'd', 'ms');
  for (let time = min - oneDay; time < max + oneDay; time += oneDay) {
    sunTimes.push(getTimes(new Date(time), ...gpsCoords));
  }
  return sunTimes.slice(0, -1).map(({ sunset }, i) => ({
    type: 'box',
    xScaleID: 'x-axis-0',
    xMin: +sunset,
    xMax: +sunTimes[i + 1].sunrise,
    yMin: -9999,
    yMax: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  }));
}

export function buildNowLine() {
  return {
    type: 'line',
    mode: 'vertical',
    scaleID: 'x-axis-0',
    value: +new Date(),
    borderColor: 'indianred',
  };
}

function midnight(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return +date + convertTime(offset, 'd', 'ms');
}
