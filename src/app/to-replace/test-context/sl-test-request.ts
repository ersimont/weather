import { TestRequest } from '@angular/common/http/testing';
import { AngularContext } from '@s-libs/ng-dev';
import { BodyType } from './expect-request';

export class SlTestRequest<Body> {
  request = this.req.request;

  constructor(private req: TestRequest, private ctx?: AngularContext) {}

  flush(body: Body): void {
    this.req.flush(body);
    this.tickIfPossible();
  }

  flushError(
    status = 500,
    { statusText = 'simulated test error', body = null as BodyType } = {},
  ): void {
    this.req.flush(body, { status, statusText });
    this.tickIfPossible();
  }

  isCancelled(): boolean {
    return this.req.cancelled;
  }

  private tickIfPossible(): void {
    this.ctx?.tick();
  }
}
