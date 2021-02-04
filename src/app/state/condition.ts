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
  getUnitInfo(units: Units): UnitInfo;
}

export const conditionInfo: Record<Condition, ConditionInfo> = {
  [Condition.AMOUNT]: {
    label: 'Precip Amount',
    getUnitInfo: (units: Units) => unitInfo[units.amount],
  },
  [Condition.CLOUD]: {
    label: 'Cloud Cover',
    getUnitInfo: () => unitInfo[PercentageUnit.PCT],
  },
  [Condition.DEW]: {
    label: 'Dew Point',
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.FEEL]: {
    label: 'Feel',
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.TEMP]: {
    label: 'Temp',
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.WIND]: {
    label: 'Wind',
    getUnitInfo: (units: Units) => unitInfo[units.speed],
  },
};
