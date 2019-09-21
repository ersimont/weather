import { identity } from "micro-dash";
import { mapToObject } from "../to-replace/map-to-object";
import { convertAmount, convertSpeed, convertTemp, Units } from "./units";

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
    convert: (value: number, units: Units) => convertTemp(value, units.temp),
    getSuffix: (units: Units) => " " + units.temp,
  },
  [Condition.FEEL]: {
    label: "Feel",
    color: colors[Condition.FEEL],
    convert: (value: number, units: Units) => convertTemp(value, units.temp),
    getSuffix: (units: Units) => " " + units.temp,
  },
  [Condition.DEW]: {
    label: "Dew Point",
    color: colors[Condition.DEW],
    convert: (value: number, units: Units) => convertTemp(value, units.temp),
    getSuffix: (units: Units) => " " + units.temp,
  },
  [Condition.WIND]: {
    label: "Wind",
    color: colors[Condition.WIND],
    convert: (value: number, units: Units) => convertSpeed(value, units.speed),
    getSuffix: (units: Units) => " " + units.speed,
  },
  [Condition.CHANCE]: {
    label: "Precip Chance",
    color: colors[Condition.CHANCE],
    convert: identity,
    getSuffix: () => "%",
  },
  [Condition.AMOUNT]: {
    label: "Precip Amount",
    color: colors[Condition.AMOUNT],
    convert: (value: number, units: Units) =>
      convertAmount(value, units.amount),
    getSuffix: (units: Units) => " " + units.amount,
  },
};
