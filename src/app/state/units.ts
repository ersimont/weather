import { DecimalPipe } from '@angular/common';
import { identity } from '@s-libs/micro-dash';

export type UnitType = 'temp' | 'amount' | 'speed' | 'percentage';
export type UnitEnum = TempUnit | AmountUnit | SpeedUnit | PercentageUnit;

export enum TempUnit {
  F = '°F',
  C = '°C',
}

export enum AmountUnit {
  IN = 'in',
  MM = 'mm',
}

export enum SpeedUnit {
  MPH = 'mph',
  KTS = 'kts',
  KPH = 'km/h',
}

export enum PercentageUnit {
  PCT = '%',
}

export class Units {
  temp = TempUnit.F;
  amount = AmountUnit.IN;
  speed = SpeedUnit.MPH;
}

export interface UnitInfo {
  convert(value: number): number;
  getDisplay(value: number, decimalPipe: DecimalPipe): string;
}

export const unitInfo: Record<UnitEnum, UnitInfo> = {
  [TempUnit.F]: {
    convert: (value: number) => value * 1.8 + 32,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)} ${TempUnit.F}`,
  },
  [TempUnit.C]: {
    convert: identity,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)} ${TempUnit.C}`,
  },
  [AmountUnit.IN]: {
    convert: (value: number) => value / 25.4,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 2, decimalPipe)} ${AmountUnit.IN}`,
  },
  [AmountUnit.MM]: {
    convert: identity,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 1, decimalPipe)} ${AmountUnit.MM}`,
  },
  [SpeedUnit.MPH]: {
    convert: (value: number) => value * 1.151,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)} ${SpeedUnit.MPH}`,
  },
  [SpeedUnit.KTS]: {
    convert: identity,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)} ${SpeedUnit.KTS}`,
  },
  [SpeedUnit.KPH]: {
    convert: (value: number) => value * 1.852,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)} ${SpeedUnit.KPH}`,
  },
  [PercentageUnit.PCT]: {
    convert: identity,
    getDisplay: (value: number, decimalPipe: DecimalPipe) =>
      `${round(value, 0, decimalPipe)}%`,
  },
};

function round(
  value: number,
  precision: number,
  decimalPipe: DecimalPipe,
): string {
  return decimalPipe.transform(value, `1.${precision}-${precision}`)!;
}
