import { HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { mapAsKeys } from '@s-libs/js-core';
import { isEqual } from '@s-libs/micro-dash';
import { AngularContext } from '@s-libs/ng-dev';
import { SlTestRequest } from './sl-test-request';

export type MethodType = 'DELETE' | 'GET' | 'POST' | 'PUT';
export type BodyType = Parameters<TestRequest['flush']>[0];
export interface SlTestRequestOptions {
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: BodyType;
  ctx: AngularContext;
}

export function expectRequest<T>(
  method: MethodType,
  url: string,
  { params = {}, headers = {}, body = null, ctx }: SlTestRequestOptions,
): SlTestRequest<T> {
  expect().nothing(); // convince jasmine we are expecting something

  const pending: HttpRequest<any>[] = [];
  try {
    const controller = ctx.inject(HttpTestingController);
    return new SlTestRequest<T>(controller.expectOne(isMatch), ctx);
  } catch (error) {
    console.log({ expected: { method, url, params, body }, actual: pending });
    throw error; // TODO: throw custom error with nice message
  }

  function isMatch(req: HttpRequest<any>): boolean {
    pending.push(req);
    return (
      req.method === method &&
      req.url === url &&
      matchAngularHttpMap(req.params, params) &&
      matchAngularHttpMap(req.headers, headers) &&
      isEqual(req.body, body)
    );
  }
}

interface AngularHttpMap {
  keys(): string[];
  get(key: string): string | null;
}

function matchAngularHttpMap(
  actual: AngularHttpMap,
  expected: Record<string, string>,
): boolean {
  const actualObj = mapAsKeys(actual.keys(), (key) => actual.get(key));
  return isEqual(actualObj, expected);
}
