import { BugsnagConfig } from 'app/to-replace/bugsnag/bugsnag.module';

interface Env {
  bugsnagConfig?: BugsnagConfig;
  gaProperty?: string;
  logEvents: boolean;
  paintGraph: boolean;
  pwa: boolean;
  storeDevtools: boolean;
}
