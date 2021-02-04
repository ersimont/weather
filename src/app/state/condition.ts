import { mapToObject } from '@s-libs/js-core';
import { PercentageUnit, UnitInfo, unitInfo, Units } from './units';

export enum Condition {
  /** store in celsius */
  TEMP = 'temp',
  /** store in celsius */
  FEEL = 'feel',
  /** store in celsius */
  DEW = 'dew',
  /** store in mm */
  AMOUNT = 'amount',
  /** store in percent [0-100] */
  CLOUD = 'cloud',
  /** store in knots */
  WIND = 'wind',
}

export type Conditions = Partial<Record<Condition, number>>;

export interface ConditionInfo {
  label: string;
  getColor: () => string;
  getUnitInfo(units: Units): UnitInfo;
}

export const conditionInfo: Record<Condition, ConditionInfo> = {
  [Condition.AMOUNT]: {
    label: 'Precip Amount',
    getColor: buildGetColor(Condition.AMOUNT),
    getUnitInfo: (units: Units) => unitInfo[units.amount],
  },
  [Condition.CLOUD]: {
    label: 'Cloud Cover',
    getColor: buildGetColor(Condition.CLOUD),
    getUnitInfo: () => unitInfo[PercentageUnit.PCT],
  },
  [Condition.DEW]: {
    label: 'Dew Point',
    getColor: buildGetColor(Condition.DEW),
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.FEEL]: {
    label: 'Feel',
    getColor: buildGetColor(Condition.FEEL),
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.TEMP]: {
    label: 'Temp',
    getColor: buildGetColor(Condition.TEMP),
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.WIND]: {
    label: 'Wind',
    getColor: buildGetColor(Condition.WIND),
    getUnitInfo: (units: Units) => unitInfo[units.speed],
  },
};

let colors: Record<Condition, string> | undefined;
function buildGetColor(condition: Condition): () => string {
  return () => {
    if (!colors) {
      const bodyStyles = getComputedStyle(document.body);
      colors = mapToObject(Condition, (c: Condition) => [
        c,
        bodyStyles.getPropertyValue(`--${c}`),
      ]) as Record<Condition, string>;
    }
    return colors[condition];
  };
}
