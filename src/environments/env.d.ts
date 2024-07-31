import { BugsnagConfig } from 'app/to-replace/bugsnag/lazy-bugsnag';

interface Env {
  bugsnagConfig?: BugsnagConfig;
  eventTrackingConfig: EventTrackingConfig;
  paintGraph: boolean;
  pwa: boolean;
  storeDevtools: boolean;
}
