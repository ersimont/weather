import { RefreshServiceHarness } from 'app/misc-services/refresh.service.harness';
import { SourceOptionsComponentHarness } from 'app/options/source-options/source-options.component.harness';
import { OpenWeatherHarness } from 'app/sources/open-weather/open-weather.harness';
import { SourceId } from 'app/state/source';
import { WeatherStateHarness } from 'app/state/weather-state.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { SnackBarErrorServiceHarness } from 'app/to-replace/snack-bar-error.service.harness';

describe('OpenWeather', () => {
  let ctx: WeatherGraphContext;
  let openWeather: OpenWeatherHarness;
  let errors: SnackBarErrorServiceHarness;
  let refresh: RefreshServiceHarness;
  let state: WeatherStateHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ errors, openWeather, refresh, state } = ctx.harnesses);

    ctx.harnesses.state.setShowing(SourceId.OPEN_WEATHER);
  });

  it('handles errors', () => {
    state.setCustomLocation();
    ctx.run(() => {
      openWeather.expectForecast().flushError();
      errors.expectGeneric();

      refresh.trigger();
      openWeather.expectForecast();
    });
  });

  it('can cancel its request', () => {
    state.setCustomLocation();
    ctx.run(() => {
      const sources = ctx.getHarness(SourceOptionsComponentHarness);
      sources.toggle('OpenWeather');
      expect(openWeather.expectForecast().isCancelled()).toBe(true);

      sources.toggle('OpenWeather');
      openWeather.flushDefault();
    });
  });
});
