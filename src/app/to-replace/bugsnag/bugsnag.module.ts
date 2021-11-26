import { CommonModule } from '@angular/common';
import {
  ErrorHandler,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import Bugsnag, { BrowserConfig } from '@bugsnag/js';
import { BugsnagErrorHandler } from '@bugsnag/plugin-angular';

export type BugsnagConfig = BrowserConfig;
export const bugsnagToken = new InjectionToken<BugsnagErrorHandler>('bugsnag');

@NgModule({ imports: [CommonModule] })
export class BugsnagModule {
  static forRoot(config: BugsnagConfig): ModuleWithProviders<BugsnagModule> {
    return {
      ngModule: BugsnagModule,
      providers: [
        {
          provide: bugsnagToken,
          useFactory: () => {
            Bugsnag.start({
              collectUserIp: false,
              generateAnonymousId: false,
              ...config,
            });
            return new BugsnagErrorHandler();
          },
        },
        { provide: ErrorHandler, useExisting: bugsnagToken },
      ],
    };
  }
}
