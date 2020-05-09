import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AbstractType, InjectionToken, Type } from '@angular/core';
import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { DomContext } from 'app/to-replace/test-context/dom-context';
import { clone, forOwn, isFunction } from 'micro-dash';
import { isArray } from 'rxjs/internal-compatibility';
import { assert } from 's-js-utils';

export function extendMetadata(
  metadata: TestModuleMetadata,
  toAdd: TestModuleMetadata,
): TestModuleMetadata {
  const result: any = clone(metadata);
  forOwn(toAdd, (val, key) => {
    result[key] = isArray(result[key]) ? result[key].concat(val) : val;
  });
  return result;
}

export abstract class AngularContext<InitOptions> extends DomContext {
  constructor(moduleMetadata: TestModuleMetadata) {
    super();
    TestBed.configureTestingModule(
      extendMetadata(moduleMetadata, { imports: [HttpClientTestingModule] }),
    );
  }

  run(test: () => void): void;
  run(options: Partial<InitOptions>, test: () => void): void;
  run(optionsOrTest: Partial<InitOptions> | (() => void), test?: () => void) {
    let options: Partial<InitOptions> = {};
    if (isFunction(optionsOrTest)) {
      test = optionsOrTest;
    } else {
      options = optionsOrTest;
    }

    fakeAsync(() => {
      assert(test);
      this.init(options);
      try {
        test();
      } finally {
        this.cleanUp();
      }
    })();
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>) {
    return TestBed.inject(token);
  }

  tick(millis?: number) {
    tick(millis);
  }

  dispatch(event: Event, element: Element) {
    super.dispatch(event, element);
    this.tick();
  }

  protected init(_options: Partial<InitOptions>) {}

  protected cleanUp() {
    this.inject(HttpTestingController).verify();
    discardPeriodicTasks();
  }
}
