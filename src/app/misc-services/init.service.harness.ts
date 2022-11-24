import { MatLegacySnackBarHarness as MatSnackBarHarness } from '@angular/material/legacy-snack-bar/testing';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class InitServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  async cleanUpFreshInit(): Promise<void> {
    this.ctx.tick(2000);
    await this.expectPrompt();
  }

  async expectNoPrompt(): Promise<void> {
    expect(await this.ctx.getAllHarnesses(MatSnackBarHarness)).toEqual([]);
  }

  async expectPrompt(): Promise<void> {
    const bar = await this.ctx.getHarness(MatSnackBarHarness);
    expect(await bar.getMessage()).toBe('Choose a location');
    await bar.dismissWithAction();
  }
}
