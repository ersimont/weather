export class PersistenceServiceHarness {
  getPersistedState() {
    return JSON.parse(localStorage.getItem("weather")!);
  }
}
