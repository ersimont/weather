import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { pointResponse } from 'app/sources/weather-gov/weather-gov.fixtures';
import { WeatherGovHarness } from 'app/sources/weather-gov/weather-gov.harness';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('WeatherGov', () => {
  let ctx: WeatherGraphContext;
  let errors: SnackBarErrorServiceHarness;
  let gov: WeatherGovHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, gov, refresh, state } = ctx.harnesses);
  });

  it('can cancel the first request', () => {
    state.setCustomLocation();
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);
      sources.toggle('Weather.gov');
      expect(gov.expectPoints().isCancelled()).toBe(true);

      sources.toggle('Weather.gov');
      gov.flushFixture();
    });
  });

  it('can cancel the second request', () => {
    state.setCustomLocation();
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);
      gov.expectPoints().flush(pointResponse);
      sources.toggle('Weather.gov');
      expect(gov.expectGrid().isCancelled()).toBe(true);

      sources.toggle('Weather.gov');
      gov.flushFixture();
    });
  });

  it('does not prevent refreshes after error', () => {
    state.setCustomLocation();
    ctx.run(() => {
      gov.expectPoints().flushError();
      errors.expectGeneric();

      refresh.trigger();
      gov.expectPoints().flush(pointResponse);
      gov.expectGrid().flushError();
      errors.expectGeneric();

      refresh.trigger();
      gov.flushFixture();
    });
  });

  it('rounds gps coordinates to 4 decimal places', () => {
    state.setCustomLocation([12.34567, 76.54321]);
    ctx.run(() => {
      gov.expectPoints([12.3457, 76.5432]);
    });
  });
});
