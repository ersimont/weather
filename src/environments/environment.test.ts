import { enableProdMode } from '@angular/core';

export const environment: Env = {
  pwa: false,
  logEvents: false,
  paintGraph: false,
  storeDevtools: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error'; // Included with Angular CLI.
(Error as any).stackTraceLimit = 0;
enableProdMode();
