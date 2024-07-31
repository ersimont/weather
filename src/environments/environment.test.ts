import { Env } from './env';

export const environment: Env = {
  eventTrackingConfig: {
    mixpanelToken: 'dummy token so it sends events to the mock backend',
  },
  paintGraph: false,
  pwa: false,
  storeDevtools: false,
};

// faster
// (Error as any).stackTraceLimit = 0;
