export const eventCatalog = {
  change_condition: [
    'change_temp',
    'change_feel',
    'change_dew',
    'change_amount',
    'change_cloud',
    'change_wind',
  ],
  change_location: ['change_current_selection', 'change_custom_search'],
  change_source: [
    'change_openWeather',
    'change_tomorrowIo',
    'change_visualCrossing',
    'change_weatherGov',
    'change_weatherUnlocked',
  ],
  change_unit: [
    'change_temp',
    'change_amount',
    'change_speed',
    'change_percentage',
  ],
  initialization: ['initialize_fresh_state', 'show_whats_new'],
  navigate: [
    'click_about',
    'click_privacy_policy',
    'close_condition_options',
    'close_location_options',
    'close_source_options',
    'close_unit_options',
    'open_condition_options',
    'open_location_options',
    'open_source_options',
    'open_unit_options',
  ],
  refresh: ['interval_refresh', 'focus_refresh'],
  set_range: ['click_day', 'click_three_days', 'click_week'],
  zoom_and_pan: ['change_pan', 'change_zoom'],
};
