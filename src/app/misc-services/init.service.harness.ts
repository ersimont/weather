import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class InitServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  cleanUpFreshInit() {
    this.ctx.tick(2000);
    this.expectPrompt();
  }

  expectNoPrompt() {
    expect(this.ctx.getHarnessOptional(MatSnackBarHarness)).toBe(null);
  }

  expectPrompt() {
    const bar = this.ctx.getHarness(MatSnackBarHarness);
    expect(bar.getMessage()).toBe('Choose a location');
    bar.dismissWithAction();
  }
}
