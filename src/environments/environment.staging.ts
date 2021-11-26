import { enableProdMode } from '@angular/core';
import { Env } from './env';

export const environment: Env = {
  bugsnagConfig: {
    apiKey: 'ed6690791c812d163fb92d4ad7a21ef4',
    releaseStage: 'staging',
  },
  gaProperty: 'UA-148865234-2',
  logEvents: true,
  paintGraph: true,
  pwa: true,
  storeDevtools: true,
};

enableProdMode();
