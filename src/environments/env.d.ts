import { BugsnagConfig } from 'app/to-replace/bugsnag/lazy-bugsnag';

interface Env {
  bugsnagConfig?: BugsnagConfig;
  gaProperty?: string;
  logEvents: boolean;
  paintGraph: boolean;
  pwa: boolean;
  storeDevtools: boolean;
}
