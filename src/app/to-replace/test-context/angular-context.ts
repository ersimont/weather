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
import { SynchronizedObject } from 'app/to-replace/fake-async-harnesses/synchronize';
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

export abstract class AngularContext<InitOptions = {}> extends DomContext {
  private loader = FakeAsyncHarnessEnvironment.documentRootLoader(this);

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
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.debug(err);
        throw err;
      } finally {
        this.cleanUp();
      }
    })();
  }

  inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>) {
    return TestBed.inject(token);
  }

  getHarness<T extends ComponentHarness>(
    query: HarnessQuery<T>,
  ): SynchronizedObject<T> {
    return this.loader.getHarness(query) as SynchronizedObject<T>;
  }

  getAllHarnesses<T extends ComponentHarness>(
    query: HarnessQuery<T>,
  ): Array<SynchronizedObject<T>> {
    return (this.loader.getAllHarnesses(query) as unknown) as Array<
      SynchronizedObject<T>
    >;
  }

  tick(millis?: number) {
    flushMicrotasks();
    this.inject(ApplicationRef).tick();
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
