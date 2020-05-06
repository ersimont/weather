import { fakeAsync } from '@angular/core/testing';
import { WeatherGraphContext } from 'app/test-helpers/weather-graph-context';
import { WhatsNewComponentHarness } from 'app/upgrade/whats-new.component.harness';

describe('WhatsNewComponent', () => {
  WeatherGraphContext.setUp();

  let ctx: WeatherGraphContext;
  let whatsNew: WhatsNewComponentHarness;
  beforeEach(() => {
    ctx = new WeatherGraphContext();
    ({ whatsNew } = ctx.harnesses);
  });

  it('does not show when there is no upgrade', fakeAsync(() => {
    ctx.init();
    expect(whatsNew.isShowing()).toBe(false);
    ctx.cleanUp();
  }));
});
