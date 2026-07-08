import { InjectionToken } from '@angular/core';
import { BrowserConfig } from '@bugsnag/js';

export type BugsnagConfig = BrowserConfig;

export const CONFIG = new InjectionToken<BugsnagConfig>('BugsnagConfig');
