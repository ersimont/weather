import { WeatherState } from 'app/state/weather-state';

export const v9Default = {
  _version: 9,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  allowSourceFallback: true,
  sources: {
    climacell: { label: 'Climacell', show: false, forecast: {} },
    openWeather: { label: 'OpenWeather', show: false, forecast: {} },
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

export const defaultState = v9Default as WeatherState;

export const v8Default = {
  _version: 8,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  allowSourceFallback: true,
  sources: {
    climacell: { label: 'Climacell', show: false, forecast: {} },
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

export const v7Default = {
  _version: 7,
  allowSourceFallback: true,
  useCurrentLocation: false,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  sources: {
    climacell: { label: 'Climacell', show: false, forecast: {} },
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
} as const;

export const v6Default = {
  version: 6,
  allowSourceFallback: true,
  useCurrentLocation: true,
  currentLocation: { search: '' },
  customLocation: { search: '' },
  sources: {
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
} as const;

export const v5Example = {
  version: 5,
  useCurrentLocation: true,
  currentLocation: {
    search: '',
    gpsCoords: [42.1716779, -85.5900794],
    city: 'Portage, MI',
  },
  customLocation: {
    search: '',
  },
  sources: {
    weatherGov: {
      label: 'Weather.gov',
      show: false,
      forecast: {
        '1569441600000': {
          temp: 22.77777777777783,
          feel: 22.77777777777783,
          dew: 16.666666666666742,
          chance: 13,
          amount: 0,
          wind: 6.687772,
        },
      },
    },
    weatherUnlocked: {
      label: 'Weather Unlocked',
      show: true,
      forecast: {
        '1589241600000': {
          amount: 0,
          cloud: 4,
          dew: 1,
          feel: 5,
          temp: 7.5,
          wind: 8,
        },
      },
    },
  },
  units: {
    temp: '°C',
    amount: 'mm',
    speed: 'km/h',
  },
  showConditions: {
    temp: true,
    feel: false,
    dew: true,
    wind: false,
    chance: true,
    amount: true,
  },
  allowSourceFallback: false,
} as const;
