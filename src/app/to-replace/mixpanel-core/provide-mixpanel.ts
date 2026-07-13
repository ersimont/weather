import { Provider } from '@angular/core';
import { MixpanelConfig } from 'app/to-replace/mixpanel-core/mixpanel-config';
import { MixpanelService } from 'app/to-replace/mixpanel-core/mixpanel.service';

export function provideMixpanel(config: MixpanelConfig): Provider[] {
  return [{ provide: MixpanelConfig, useValue: config }, MixpanelService];
}
