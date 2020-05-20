import { WeatherState } from 'app/state/weather-state';

export class WeatherStoreHarness {
  getPersistedState(): WeatherState {
    return JSON.parse(localStorage.getItem('weather')!);
  }
}
