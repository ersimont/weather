import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { AmountUnit } from 'app/state/units';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('WeatherStore', () => {
  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let store: WeatherStoreHarness;
  let units: UnitOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, store, units } = ctx.harnesses);
  });

  it('persists changes to the state', () => {
    ctx.initialState.units.amount = AmountUnit.IN;
    ctx.run(() => {
      units.select('MM');
      expect(store.getPersistedState().units.amount).toBe(AmountUnit.MM);
    });
  });

  it('tracks an event when initializing a fresh state', () => {
    ctx.run({ useInitialState: false }, () => {
      const tracked = events.getEvents('initialize_fresh_state');
      expect(tracked.length).toBe(1);
      expect(tracked[0].interaction).toBe(false);
    });
  });

  it('does not track an event if there is saved state', () => {
    ctx.run({ useInitialState: true }, () => {
      expect(events.getEvents('initialize_fresh_state').length).toBe(0);
    });
  });
});
