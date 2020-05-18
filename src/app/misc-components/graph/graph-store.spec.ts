import { GraphStateHarness } from 'app/misc-components/graph/graph-state.harness';
import { LocationIqServiceHarness } from 'app/misc-services/location-iq.service.harness';
import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';

describe('GraphStore', () => {
  let ctx: WeatherGraphContext;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
  });

  it('adjusts the night boxes when changing location', () => {
    jasmine.clock().mockDate(new Date(1980, 11, 4, 10));
    ctx.run(() => {
      const graphState = new GraphStateHarness(ctx);
      expect(graphState.getNightBoxes()).toEqual([
        { from: 1589590989347, to: 1589641750190 },
        { from: 1589677344441, to: 1589728198775 },
        { from: 1589763700995, to: 1589814646909 },
        { from: 1589850059026, to: 1589901094556 },
        { from: 1589936418550, to: 1589987541684 },
        { from: 1590022779583, to: 1590073988257 },
        { from: 1590109142141, to: 1590160434239 },
        { from: 1590195506237, to: 1590246879595 },
        { from: 1590281871887, to: 1590333324288 },
        { from: 1590368239101, to: 1590419768283 },
      ]);

      ctx.mocks.browser.getCurrentLocation.and.resolveTo([10, -20]);
      new RefreshServiceHarness(ctx).trigger();
      new LocationIqServiceHarness(ctx).flushReverse([10, -20]);
      expect(graphState.getNightBoxes()).toEqual([
        { from: 1589657727316, to: 1589698797424 },
        { from: 1589744140785, to: 1589785189551 },
        { from: 1589830554533, to: 1589871582427 },
        { from: 1589916968546, to: 1589957976046 },
        { from: 1590003382809, to: 1590044370406 },
        { from: 1590089797307, to: 1590130765502 },
        { from: 1590176212024, to: 1590217161327 },
        { from: 1590262626943, to: 1590303557877 },
        { from: 1590349042048, to: 1590389955144 },
        { from: 1590435457322, to: 1590476353121 },
      ]);
      new WeatherGovHarness(ctx).expectPoints([10, -20]);
    });
  });
});
