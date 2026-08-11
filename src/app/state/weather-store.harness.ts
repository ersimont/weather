import { WeatherState } from 'app/state/weather-state';
import { AsyncPersistence } from 'app/to-replace/js-core/persistence/async-persistence';

export class WeatherStoreHarness {
  #persistence = new AsyncPersistence<WeatherState>('weather-store');

  async setPersistedState(state: WeatherState): Promise<void> {
    await this.#persistence.put(state);
  }

  async getPersistedState(): Promise<WeatherState> {
    const state = await this.#persistence.get();
    assert(state);
    return state;
  }

  async clear(): Promise<void> {
    await this.#persistence.clear();
  }
}
