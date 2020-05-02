export const v7Default = {
  _version: 7,
  allowSourceFallback: true,
  useCurrentLocation: true,
  currentLocation: { search: "" },
  customLocation: { search: "" },
  sources: {
    climacell: { label: "Climacell", show: false, forecast: {} },
    weatherGov: { label: "Weather.gov", show: true, forecast: {} },
    weatherUnlocked: { label: "Weather Unlocked", show: false, forecast: {} },
  },
  units: { temp: "°F", amount: "in", speed: "mph" },
  showConditions: {
    temp: true,
    feel: true,
    dew: true,
    amount: true,
    cloud: true,
    wind: true,
  },
};

export const defaultState = v7Default;

export const v6Default = {
  version: 6,
  allowSourceFallback: true,
  useCurrentLocation: true,
  currentLocation: { search: "" },
  customLocation: { search: "" },
  sources: {
    weatherGov: { label: "Weather.gov", show: true, forecast: {} },
    weatherUnlocked: { label: "Weather Unlocked", show: false, forecast: {} },
  },
  units: { temp: "°F", amount: "in", speed: "mph" },
  showConditions: {
    temp: true,
    feel: true,
    dew: true,
    amount: true,
    cloud: true,
    wind: true,
  },
};
