import { Env } from './env';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: Env = {
  bugsnagConfig: {
    apiKey: 'ed6690791c812d163fb92d4ad7a21ef4',
    releaseStage: 'development',
  },
  gaProperty: 'UA-148865234-2',
  logEvents: true,
  paintGraph: true,
  pwa: false,
  storeDevtools: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
