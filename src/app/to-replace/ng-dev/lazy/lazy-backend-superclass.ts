import { InjectionToken, Type } from '@angular/core';

export class LazyBackendSuperclass<T> {
  constructor(protected impl: T) {}

  static createToken<T extends LazyBackendSuperclass<unknown>>(
    type: Type<T>,
    loadImpl: () => Promise<
      T extends LazyBackendSuperclass<infer B> ? B : never
    >,
  ): InjectionToken<Promise<T>> {
    return new InjectionToken('', {
      factory: async (): Promise<T> => {
        const impl = await loadImpl();
        return new type(impl);
      },
    });
  }
}
