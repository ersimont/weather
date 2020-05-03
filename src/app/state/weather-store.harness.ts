export class WeatherStoreHarness {
  getPersistedState() {
    return JSON.parse(localStorage.getItem("weather")!);
  }
}
