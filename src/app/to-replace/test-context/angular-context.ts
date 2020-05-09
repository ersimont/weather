import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AbstractType, InjectionToken, Type } from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { DomContext } from 'app/to-replace/test-context/dom-context';
import { isFunction } from 'micro-dash';
import { assert } from 's-js-utils';

export abstract class AngularContext<InitOptions> extends DomContext {
  protected moduleMetadata: Required<
    Omit<TestModuleMetadata, 'schemas' | 'aotSummaries'>
  > = {
    imports: [HttpClientTestingModule],
    declarations: [],
    providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
  };

  static setUp() {}

  run(test: () => void): void;
  run(options: Partial<InitOptions>, test: () => void): void;
  run(optionsOrTest: Partial<InitOptions> | (() => void), test?: () => void) {
    let options: Partial<InitOptions> = {};
    if (isFunction(optionsOrTest)) {
      test = optionsOrTest;
    } else {
      options = optionsOrTest;
    }

    TestBed.configureTestingModule(this.moduleMetadata);
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

  // injectIfProvided<T>(
  //   token: Type<T> | InjectionToken<T> | AbstractType<T>,
  // ): T | undefined {
  //   return TestBed.inject(token, undefined, InjectFlags.Optional);
  // }

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
