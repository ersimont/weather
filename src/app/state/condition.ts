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

const bodyStyles = getComputedStyle(document.body);
const colors = mapToObject(Condition, (condition: Condition) => [
  condition,
  bodyStyles.getPropertyValue(`--${condition}`),
]) as Record<Condition, string>;

export interface ConditionInfo {
  label: string;
  color: string;
  getUnitInfo(units: Units): UnitInfo;
}

export const conditionInfo: Record<Condition, ConditionInfo> = {
  [Condition.AMOUNT]: {
    label: 'Precip Amount',
    color: colors[Condition.AMOUNT],
    getUnitInfo: (units: Units) => unitInfo[units.amount],
  },
  [Condition.CLOUD]: {
    label: 'Cloud Cover',
    color: colors[Condition.CLOUD],
    getUnitInfo: () => unitInfo[PercentageUnit.PCT],
  },
  [Condition.DEW]: {
    label: 'Dew Point',
    color: colors[Condition.DEW],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.FEEL]: {
    label: 'Feel',
    color: colors[Condition.FEEL],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.TEMP]: {
    label: 'Temp',
    color: colors[Condition.TEMP],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.WIND]: {
    label: 'Wind',
    color: colors[Condition.WIND],
    getUnitInfo: (units: Units) => unitInfo[units.speed],
  },
};
