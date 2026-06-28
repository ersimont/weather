import { Mock } from 'vitest';

type Func = (...args: any[]) => any;

export function ensureSpiedOn<T extends object, K extends keyof T>(
  object: T,
  method: T[K] extends Func ? K : never,
): T[K] extends Mock ? T[K] : T[K] extends Func ? Mock<T[K]> : never {
  const obj: any = object;
  if ('and' in obj[method]) {
    return obj[method];
  } else {
    return vitest.spyOn(object, method as any) as any;
  }
}
