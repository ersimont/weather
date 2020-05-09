import { HttpRequest } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AngularContext } from 'app/to-replace/test-context/angular-context';
import { isEqual } from 'micro-dash';
import { mapAsKeys } from 's-js-utils';

export type MethodType = 'DELETE' | 'GET' | 'POST' | 'PUT';
export type BodyType = Parameters<TestRequest['flush']>[0];
export interface STestRequestOptions {
  params?: Record<string, string>;
  body?: BodyType;
}

export class STestRequest<T> {
  protected req: TestRequest;

  constructor(
    method: MethodType,
    url: string,
    private ctx: AngularContext<any>,
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

    function isMatch(req: HttpRequest<any>) {
      pending.push(req);
      return (
        req.method === method &&
        req.url === url &&
        paramsMatch(req, params) &&
        isEqual(req.body, body)
      );
    }
  }

  getHeaders() {
    return this.req.request.headers;
  }

  flush(body: T) {
    this.req.flush(body);
    this.ctx.tick();
  }

  flushError(status = 500, { statusText = '', body = null as BodyType } = {}) {
    this.req.flush(body, { status, statusText });
    this.ctx.tick();
  }

  isCancelled() {
    return this.req.cancelled;
  }
}

function paramsMatch(req: HttpRequest<any>, params: Record<string, string>) {
  const actual = mapAsKeys(req.params.keys(), (key) => req.params.get(key));
  return isEqual(actual, params);
}
