import { convertTime } from '@s-libs/js-core';
import { Env } from './env';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: Env = {
  eventTrackingConfig: { log: true },
  paintGraph: true,
  pwa: false,
  storeDevtools: true,
  refreshMillis: convertTime(30, 'min', 'ms'),
};
