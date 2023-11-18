import { CommonModule } from '@angular/common';
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { BugsnagConfig, LazyBugsnag } from './lazy-bugsnag';

@NgModule({ imports: [CommonModule] })
export class BugsnagModule {
  static forRoot(config: BugsnagConfig): ModuleWithProviders<BugsnagModule> {
    LazyBugsnag.start({
      collectUserIp: false,
      generateAnonymousId: false,
      ...config,
    });
    return {
      ngModule: BugsnagModule,
      providers: [
        {
          provide: ErrorHandler,
          useValue: {
            handleError(error: any): void {
              console.error(error);
              LazyBugsnag.notify(error);
            },
          },
        },
      ],
    };
  }
}
