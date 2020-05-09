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
    'change_weatherGov',
    'change_weatherUnlocked',
    'change_climacell',
  ],
  change_unit: [
    'change_temp',
    'change_amount',
    'change_speed',
    'change_percentage',
  ],
  initialization: ['initialize_fresh_state', 'show_whats_new'],
  navigate: ['click_privacy_policy'],
  refresh: [
    'init_refresh', // TODO: remove
    'location_change_refresh', // TODO: remove
    'interval_refresh',
    'focus_refresh',
  ],
  set_range: ['click_day', 'click_three_days', 'click_week'],
  zoom_and_pan: ['change_pan', 'change_zoom'],
};
