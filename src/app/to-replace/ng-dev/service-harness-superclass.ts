import { assert } from '@s-libs/js-core';
import { AngularContext } from '@s-libs/ng-dev';

export abstract class ServiceHarnessSuperclass {
  protected getCtx(): AngularContext {
    const ctx = AngularContext.getCurrent();
    assert(ctx);
    return ctx;
  }
}
