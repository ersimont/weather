import { AmountUnit, unitInfo } from 'app/state/units';
import { ChartOptions } from 'chart.js';
import { times } from 'micro-dash';

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  legend: { display: false },
  tooltips: { footerFontStyle: 'italic' },
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          displayFormats: { day: 'dddd' },
          tooltipFormat: 'dddd h:mm a',
          minUnit: 'hour',
        },
        ticks: {
          ...getXAxisRange(1),
          major: { enabled: true, fontStyle: 'bold' },
        },
      },
    ],
    yAxes: [
      { id: 'dynamic', position: 'left', ticks: { beginAtZero: true } },
      { id: 'percentage', position: 'right', ticks: { min: 0, max: 100 } },
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
(defaultChartOptions as any).annotation = {
  drawTime: 'beforeDatasetsDraw',
  annotations: [
    ...times(20, (i) => buildDayLine(i - 4)),
    buildLine(new Date(), 'indianred'),
  ],
};

export function getXAxisRange(days: number) {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  const min = d.toISOString();

  d.setDate(d.getDate() + days);
  const max = d.toISOString();

  return { min, max };
}

function buildDayLine(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return buildLine(date, 'silver');
}

function buildLine(date: Date, color: string) {
  return {
    type: 'line',
    mode: 'vertical',
    scaleID: 'x-axis-0',
    value: +date,
    borderColor: color,
  };
}
