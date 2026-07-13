import { BugsnagConfig } from 'app/to-replace/bugsnag/bugsnag-config';
import { MixpanelConfig } from 'app/to-replace/mixpanel-core/mixpanel-config';

interface Env {
  bugsnagConfig?: BugsnagConfig;
  mixpanelConfig: MixpanelConfig;
  paintGraph: boolean;
  pwa: boolean;
  storeDevtools: boolean;
  refreshMillis: number;
}
