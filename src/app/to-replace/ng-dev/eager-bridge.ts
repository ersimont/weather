import { inject, InjectionToken } from '@angular/core';

export class EagerBridge<T> {
  #backendPromise: Promise<T>;

  constructor(backendToken: InjectionToken<Promise<T>>) {
    this.#backendPromise = inject(backendToken);
  }

  fireAndForget<M extends MethodName<T>>(
    method: M,
    ...args: T[M] extends (...args: infer A) => any ? A : never
  ): void {
    this.trigger(method, ...args).catch((err: unknown) => {
      console.error('Error triggering lazy backend method:', method, err);
    });
  }

  async trigger<M extends MethodName<T>>(
    method: M,
    ...args: T[M] extends (...args: infer A) => any ? A : never
  ): Promise<Awaited<T[M] extends (...args: any[]) => infer R ? R : never>> {
    const backend = await this.#backendPromise;
    return (backend[method] as any)(...args);
  }
}

type Func = (...args: any[]) => any;
type MethodName<T> = keyof {
  [K in keyof T as T[K] extends Func ? K : never]: 1;
};
