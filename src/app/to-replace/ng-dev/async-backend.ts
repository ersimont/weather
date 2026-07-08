import { InjectionToken, Type } from '@angular/core';

export class AsyncBackend<T> {
  constructor(protected impl: T) {}

  static createToken<T extends AsyncBackend<unknown>>(
    type: Type<T>,
    loadImpl: () => Promise<T extends AsyncBackend<infer B> ? B : never>,
  ): InjectionToken<Promise<T>> {
    return new InjectionToken('', {
      factory: async (): Promise<T> => {
        const impl = await loadImpl();
        return new type(impl);
      },
    });
  }
}
