// https://en.wikipedia.org/wiki/Dew_point#Calculating_the_dew_point
export function calcDewPoint(
  celciusTemp: number,
  relativeHumidity: number,
): number {
  let b: number;
  let c: number;
  if (celciusTemp > 0) {
    b = 17.368;
    c = 238.88;
  } else {
    b = 17.966;
    c = 247.15;
  }
  const gamma = Math.log(
    (relativeHumidity / 100) *
      Math.exp((b - celciusTemp / 234.5) * (celciusTemp / (c + celciusTemp))),
  );
  return (c * gamma) / (b - gamma);
}
