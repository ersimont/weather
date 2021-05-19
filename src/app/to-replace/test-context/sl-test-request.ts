import { HttpHeaders, HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { mapAsKeys } from '@s-libs/js-core';
import { isEqual } from '@s-libs/micro-dash';
import { AngularContext } from '@s-libs/ng-dev';

export type MethodType = 'DELETE' | 'GET' | 'POST' | 'PUT';
export type BodyType = Parameters<TestRequest['flush']>[0];
export interface STestRequestOptions {
  params?: Record<string, string>;
  body?: BodyType;
}

export class SlTestRequest<T> {
  protected req: TestRequest;

  constructor(
    method: MethodType,
    url: string,
    private ctx: AngularContext,
    { params = {}, body = null }: STestRequestOptions = {},
  ) {
    expect().nothing(); // convince jasmine we are expecting something

    const pending: HttpRequest<any>[] = [];
    try {
      const controller = ctx.inject(HttpTestingController);
      this.req = controller.expectOne(isMatch);
    } catch (error) {
      console.log({ expected: { method, url, params, body }, actual: pending });
      throw error;
    }

    function isMatch(req: HttpRequest<any>): boolean {
      pending.push(req);
      return (
        req.method === method &&
        req.url === url &&
        paramsMatch(req, params) &&
        isEqual(req.body, body)
      );
    }
  }

  getHeaders(): HttpHeaders {
    return this.req.request.headers;
  }

  flush(body: T): void {
    this.req.flush(body);
    this.ctx.tick();
  }

  flushError(
    status = 500,
    { statusText = '', body = null as BodyType } = {},
  ): void {
    this.req.flush(body, { status, statusText });
    this.ctx.tick();
  }

  isCancelled(): boolean {
    return this.req.cancelled;
  }
}

function paramsMatch(
  req: HttpRequest<any>,
  params: Record<string, string>,
): boolean {
  const actual = mapAsKeys(req.params.keys(), (key) => req.params.get(key));
  return isEqual(actual, params);
}
