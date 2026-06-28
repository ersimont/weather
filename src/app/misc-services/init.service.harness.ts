import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class InitServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  async cleanUpFreshInit(): Promise<void> {
    await this.ctx.tick(2000);
    await this.expectChooseLocationPrompt();
  }

  async expectNoPrompt(): Promise<void> {
    expect(await this.ctx.getAllHarnesses(MatSnackBarHarness)).toEqual([]);
  }

  async expectChooseLocationPrompt(): Promise<void> {
    const bar = await this.ctx.getHarness(MatSnackBarHarness);
    expect(await bar.getMessage()).toBe('Choose a location');
    await bar.dismissWithAction();
  }
}
