import { DecimalPipe } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { AmountUnit, unitInfo } from "app/state/units";

describe("unitInfo", () => {
  let decimalPipe: DecimalPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DecimalPipe] });
    decimalPipe = TestBed.inject(DecimalPipe);
  });

  it("rounds MM precipitation to 1 decimal place", () => {
    expect(unitInfo[AmountUnit.MM].getDisplay(0.06, decimalPipe)).toBe(
      "0.1 mm",
    );
  });
});
