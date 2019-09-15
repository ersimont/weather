import { ChartDataSets } from "chart.js";

export enum Condition {
  TEMP = "temp",
  FEEL = "feel",
  DEW = "dew",
  WIND = "wind",
  PRECIP_CHANCE = "precipChance",
  PRECIP_AMOUNT = "precipAmount",
}

export type Conditions = Partial<Record<Condition, number>>;

export const conditionDisplays: Record<Condition, ChartDataSets> = {
  [Condition.TEMP]: {
    label: "Temp",
    yAxisID: "dynamic",
    borderColor: "#ff0000",
    pointBackgroundColor: "#ff0000",
  },
  [Condition.FEEL]: {
    label: "Feel",
    yAxisID: "dynamic",
    borderColor: "#ffc0c0",
    pointBackgroundColor: "#ffc0c0",
  },
  [Condition.DEW]: {
    label: "Dew Point",
    yAxisID: "dynamic",
    borderColor: "#c0c0c0",
    pointBackgroundColor: "#c0c0c0",
  },
  [Condition.WIND]: {
    label: "Wind",
    yAxisID: "dynamic",
    borderColor: "#ffff00",
    pointBackgroundColor: "#ffff00",
  },
  [Condition.PRECIP_CHANCE]: {
    label: "Precip Chance",
    yAxisID: "percentage",
    fill: true,
    borderColor: "#00c0c0",
    backgroundColor: "#00c0c020",
    pointBackgroundColor: "#00c0c0",
  },
  [Condition.PRECIP_AMOUNT]: {
    label: "Precip Amount",
    yAxisID: "percentage",
    fill: true,
    borderColor: "#0000ff",
    backgroundColor: "#0000ff60",
    pointBackgroundColor: "#0000ff",
  },
};
