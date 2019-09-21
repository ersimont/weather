export enum TempUnit {
  F = "°F",
  C = "°C",
}

export enum AmountUnit {
  IN = "in",
  MM = "mm",
}

export enum SpeedUnit {
  MPH = "mph",
  KTS = "kts",
  KPH = "km/h",
}

export class Units {
  temp = TempUnit.F;
  amount = AmountUnit.IN;
  speed = SpeedUnit.MPH;
}

export function convertTemp(celcius: number, unit: TempUnit) {
  switch (unit) {
    case TempUnit.F:
      return celcius * 1.8 + 32;
    case TempUnit.C:
      return celcius;
  }
}

export function convertAmount(millimeters: number, unit: AmountUnit) {
  switch (unit) {
    case AmountUnit.IN:
      return millimeters / 25.4;
    case AmountUnit.MM:
      return millimeters;
  }
}

export function convertSpeed(knots: number, unit: SpeedUnit) {
  switch (unit) {
    case SpeedUnit.MPH:
      return knots * 1.151;
    case SpeedUnit.KTS:
      return knots;
    case SpeedUnit.KPH:
      return knots * 1.852;
  }
}
