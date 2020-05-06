import { fakeAsync } from '@angular/core/testing';
import { UnitOptionsComponentHarness } from 'app/options/unit-options/unit-options.component.harness';
import { AmountUnit } from 'app/state/units';
import { WeatherStoreHarness } from 'app/state/weather-store.harness';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { EventTrackingServiceHarness } from 'app/to-replace/event-tracking/event-tracking.service.harness';

describe('WeatherStore', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let events: EventTrackingServiceHarness;
  let store: WeatherStoreHarness;
  let units: UnitOptionsComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ events, store, units } = ctx.harnesses);
  });

  it('persists changes to the state', fakeAsync(() => {
    ctx.initialState.units.amount = AmountUnit.IN;
    ctx.init();

    units.select('MM');

    expect(store.getPersistedState().units.amount).toBe(AmountUnit.MM);

    ctx.cleanUp();
  }));

  it('tracks an event when initializing a fresh state', fakeAsync(() => {
    ctx.init({ useInitialState: false });

    const tracked = events.getEvents({ name: 'initialize_fresh_state' });
    expect(tracked.length).toBe(1);
    expect(tracked[0].interaction).toBe(false);

    ctx.cleanUp();
  }));

  it('does not track an event if there saved state', fakeAsync(() => {
    ctx.init({ useInitialState: true });

    // TODO: somehow verify this against the catalog
    expect(events.getEvents({ name: 'initialize_fresh_state' }).length).toBe(0);

    ctx.cleanUp();
  }));
});
