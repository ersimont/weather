import { inject, InjectionToken, Provider, Type } from '@angular/core';
import { createMockObject, MockObject } from '@s-libs/ng-vitest';

export class MockBackendKit<T> {
  token: InjectionToken<MockObject<T>>;
  providers: Provider[];

  constructor(type: Type<T> & { token: InjectionToken<Promise<T>> }) {
    this.token = new InjectionToken('', {
      factory: (): MockObject<T> => createMockObject(type),
    });
    this.providers = [
      {
        provide: type.token,
        useFactory: async (): Promise<T> => inject(this.token) as any,
      },
    ];
  }
}
