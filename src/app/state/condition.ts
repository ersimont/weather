import { ChartDataSets } from "chart.js";
import { mapToObject } from "../to-replace/map-to-object";

export enum Condition {
  TEMP = "temp",
  FEEL = "feel",
  DEW = "dew",
  WIND = "wind",
  CHANCE = "chance",
  AMOUNT = "amount",
}

export type Conditions = Partial<Record<Condition, number>>;

const styles = getComputedStyle(document.body);
const colors = mapToObject(Condition, (condition: Condition) => [
  condition,
  styles.getPropertyValue(`--${condition}`),
]) as Record<Condition, string>;

export const conditionDisplays = {} as Record<Condition, ChartDataSets>;
addDataSet(Condition.TEMP, "Temp", "dynamic");
addDataSet(Condition.FEEL, "Feel", "dynamic");
addDataSet(Condition.DEW, "Dew Point", "dynamic");
addDataSet(Condition.WIND, "Wind", "dynamic");
addDataSet(Condition.CHANCE, "Precip Chance", "percentage", "20");
addDataSet(Condition.AMOUNT, "Precip Amount", "percentage", "60");

function addDataSet(
  condition: Condition,
  label: string,
  yAxisID: "dynamic" | "percentage",
  fillAlpha = "00",
) {
  const color = colors[condition];
  conditionDisplays[condition] = {
    label,
    yAxisID,
    borderColor: color,
    backgroundColor: color + fillAlpha,
    pointBackgroundColor: color,
  };
}
