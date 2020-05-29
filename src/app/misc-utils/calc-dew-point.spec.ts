import { calcDewPoint } from 'app/misc-utils/calc-dew-point';

describe('calcDewPoint()', () => {
  it('works', () => {
    expect(calcDewPoint(70, 65)).toBeCloseTo(58.9, 1);
    expect(calcDewPoint(20, 65)).toBeCloseTo(13.1, 1);
    expect(calcDewPoint(20, 90)).toBeCloseTo(18.2, 1);
    expect(calcDewPoint(20, 10)).toBeCloseTo(-12.6, 1);
    expect(calcDewPoint(-20, 90)).toBeCloseTo(-21.3, 1);
    expect(calcDewPoint(-20, 10)).toBeCloseTo(-44, 1);
  });
});
