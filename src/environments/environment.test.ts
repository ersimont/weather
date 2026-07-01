import { convertTime } from '@s-libs/js-core';
import { Env } from './env';

export const environment: Env = {
  eventTrackingConfig: {
    mixpanelToken: 'dummy token so it sends events to the mock backend',
  },
  paintGraph: false,
  pwa: false,
  storeDevtools: false,
  refreshMillis: convertTime(1.5, 'm', 'ms'),
};

// faster
// (Error as any).stackTraceLimit = 0;
