import { mapToObject } from "../to-replace/map-to-object";
import { PercentageUnit, unitInfo, Units } from "./units";

export enum Condition {
  TEMP = "temp",
  FEEL = "feel",
  DEW = "dew",
  WIND = "wind",
  CHANCE = "chance",
  AMOUNT = "amount",
}

export type Conditions = Partial<Record<Condition, number>>;

const bodyStyles = getComputedStyle(document.body);
const colors = mapToObject(Condition, (condition: Condition) => [
  condition,
  bodyStyles.getPropertyValue(`--${condition}`),
]) as Record<Condition, string>;

export const conditionInfo = {
  [Condition.TEMP]: {
    label: "Temp",
    color: colors[Condition.TEMP],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.FEEL]: {
    label: "Feel",
    color: colors[Condition.FEEL],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.DEW]: {
    label: "Dew Point",
    color: colors[Condition.DEW],
    getUnitInfo: (units: Units) => unitInfo[units.temp],
  },
  [Condition.WIND]: {
    label: "Wind",
    color: colors[Condition.WIND],
    getUnitInfo: (units: Units) => unitInfo[units.speed],
  },
  [Condition.CHANCE]: {
    label: "Precip Chance",
    color: colors[Condition.CHANCE],
    getUnitInfo: () => unitInfo[PercentageUnit.PCT],
  },
  [Condition.AMOUNT]: {
    label: "Precip Amount",
    color: colors[Condition.AMOUNT],
    getUnitInfo: (units: Units) => unitInfo[units.amount],
  },
};
