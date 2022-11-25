import { formatNumber } from '@angular/common';
import { identity } from '@s-libs/micro-dash';

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
  getDisplay(value: number, locale: string): string;
}

export const unitInfo: Record<UnitEnum, UnitInfo> = {
  [TempUnit.F]: {
    convert: (value: number) => value * 1.8 + 32,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)} ${TempUnit.F}`,
  },
  [TempUnit.C]: {
    convert: identity,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)} ${TempUnit.C}`,
  },
  [AmountUnit.IN]: {
    convert: (value: number) => value / 25.4,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 2, locale)} ${AmountUnit.IN}`,
  },
  [AmountUnit.MM]: {
    convert: identity,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 1, locale)} ${AmountUnit.MM}`,
  },
  [SpeedUnit.MPH]: {
    convert: (value: number) => value * 1.151,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)} ${SpeedUnit.MPH}`,
  },
  [SpeedUnit.KTS]: {
    convert: identity,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)} ${SpeedUnit.KTS}`,
  },
  [SpeedUnit.KPH]: {
    convert: (value: number) => value * 1.852,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)} ${SpeedUnit.KPH}`,
  },
  [PercentageUnit.PCT]: {
    convert: identity,
    getDisplay: (value: number, locale: string) =>
      `${round(value, 0, locale)}%`,
  },
};

export function metersPerSecondToKnots(mps: number): number {
  return mps * 1.944;
}

export function kilometersPerHourToKnots(kps: number): number {
  return kps / 1.852;
}

function round(value: number, precision: number, locale: string): string {
  return formatNumber(value, locale, `1.${precision}-${precision}`);
}
