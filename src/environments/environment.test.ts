import { enableProdMode } from '@angular/core';

export const environment: Env = {
  pwa: false,
  logEvents: false,
  paintGraph: false,
  storeDevtools: false,
};

// faster
(Error as any).stackTraceLimit = 0;
enableProdMode();

// slower
// import 'zone.js/plugins/zone-error';
