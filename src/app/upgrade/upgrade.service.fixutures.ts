// 2026-07-14
export const v13Default: any = {
  _version: 13,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  allowSourceFallback: true,
  sources: {
    openMateo: { label: 'Open-Mateo', show: false, forecast: {} },
    openWeather: { label: 'OpenWeather', show: false, forecast: {} },
    visualCrossing: { label: 'Visual Crossing', show: false, forecast: {} },
    weatherGov: { label: 'Weather.gov', show: true, forecast: {} },
  },
  units: { temp: '°F', amount: 'in', speed: 'mph' },
  showConditions: {
    temp: true,
    feel: true,
    dew: true,
    amount: true,
    cloud: true,
    wind: true,
  },
  viewRange: { min: -5400000, max: 81000000 },
};

export const defaultState = v13Default;

// 2022-11-25
export const v12Default: any = {
  _version: 12,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  allowSourceFallback: true,
  sources: {
    openWeather: { label: 'OpenWeather', show: false, forecast: {} },
    visualCrossing: { label: 'Visual Crossing', show: false, forecast: {} },
    weatherGov: { label: 'Weather.gov', show: true, forecast: {} },
    weatherUnlocked: { label: 'Weather Unlocked', show: false, forecast: {} },
  },
  units: { temp: '°F', amount: 'in', speed: 'mph' },
  showConditions: {
    temp: true,
    feel: true,
    dew: true,
    amount: true,
    cloud: true,
    wind: true,
  },
  viewRange: { min: -5400000, max: 81000000 },
};

// 2021-10-03
export const v11Default: any = {
  _version: 11,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  allowSourceFallback: true,
  sources: {
    openWeather: { label: 'OpenWeather', show: false, forecast: {} },
    tomorrowIo: { label: 'Tomorrow.io', show: false, forecast: {} },
    visualCrossing: { label: 'Visual Crossing', show: false, forecast: {} },
    weatherGov: { label: 'Weather.gov', show: true, forecast: {} },
    weatherUnlocked: { label: 'Weather Unlocked', show: false, forecast: {} },
  },
  units: { temp: '°F', amount: 'in', speed: 'mph' },
  showConditions: {
    temp: true,
    feel: true,
    dew: true,
    amount: true,
    cloud: true,
    wind: true,
  },
  viewRange: { min: -5400000, max: 81000000 },
};
