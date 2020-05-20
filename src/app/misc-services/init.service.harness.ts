import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

export class InitServiceHarness {
  constructor(private ctx: WeatherGraphContext) {}

  cleanUpFreshInit() {
    this.ctx.tick(2000);
    this.ctx.expectErrorShown('Choose a location'); // TODO: not an error
  }
}
