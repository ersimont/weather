import { Env } from './env';

export const environment: Env = {
  logEvents: false,
  paintGraph: false,
  pwa: false,
  storeDevtools: false,
};

// faster
// (Error as any).stackTraceLimit = 0;

// slower
// import 'zone.js/plugins/zone-error';
