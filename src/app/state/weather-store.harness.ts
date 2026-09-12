import { WeatherState } from 'app/state/weather-state';
import { MockPersistenceBackend } from '../to-replace/ng-vitest/provide-persistence.harness';

export class WeatherStoreHarness {
  #persistence: MockPersistenceBackend<WeatherState> =
    MockPersistenceBackend.get('weather-store');

  async getPersisted(): Promise<WeatherState> {
    const state = await this.#persistence.get();
    assert(state);
    return state;
  }
}
