import {
  ComponentHarness,
  HarnessQuery,
} from '@angular/cdk/testing/component-harness';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  AbstractType,
  ApplicationRef,
  InjectionToken,
  Type,
} from '@angular/core';
import {
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { FakeAsyncHarnessEnvironment } from 'app/to-replace/fake-async-harnesses/fake-async-harness-environment';
import { Synchronized } from 'app/to-replace/fake-async-harnesses/synchronize';
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

export abstract class AngularContext<InitOptions = {}> {
  startTime = new Date();

  private loader = FakeAsyncHarnessEnvironment.documentRootLoader(this);

  constructor(moduleMetadata: TestModuleMetadata) {
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

    jasmine.clock().install();
    fakeAsync(() => {
      jasmine.clock().mockDate(this.startTime);
      assert(test);

      this.init(options);
      try {
        test();
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.debug(err);
        throw err;
      } finally {
        this.cleanUp();
      }
    })();
    jasmine.clock().uninstall();
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>) {
    return TestBed.inject(token);
  }

  getHarness<T extends ComponentHarness>(query: HarnessQuery<T>) {
    return this.loader.getHarness(query) as Synchronized<T>;
  }

  getHarnessOptional<T extends ComponentHarness>(query: HarnessQuery<T>) {
    return this.loader.locatorForOptional(query)() as Synchronized<T> | null;
  }

  getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>) {
    return (this.loader.getAllHarnesses(query) as unknown) as Array<
      Synchronized<T>
    >;
  }

  tick(millis?: number) {
    flushMicrotasks();
    this.inject(ApplicationRef).tick();
    tick(millis);
  }

  protected init(_options: Partial<InitOptions>) {}

  protected cleanUp() {
    this.inject(HttpTestingController).verify();
    discardPeriodicTasks();
  }
}
