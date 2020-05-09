import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AbstractType, InjectionToken, Type } from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { DomContext } from 'app/to-replace/test-context/dom-context';
import { isFunction } from 'micro-dash';
import { assert } from 's-js-utils';

// TODO: try destroying the fixture, or test bed, or platform instead
const initialStyles = new Set(Array.from(document.querySelectorAll('style')));
function trimLeftoverStyles() {
  for (const style of Array.from(document.querySelectorAll('style'))) {
    if (!initialStyles.has(style)) {
      style.remove();
    }
  }
}

export abstract class AngularContext<InitOptions> extends DomContext {
  protected fixture?: ComponentFixture<unknown>;
  protected moduleMetadata: Required<
    Omit<TestModuleMetadata, 'schemas' | 'aotSummaries'>
  > = {
    imports: [HttpClientTestingModule],
    declarations: [],
    providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
  };

  static setUp() {
    beforeEach(() => {
      trimLeftoverStyles();
    });
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
    if (this.fixture) {
      flushMicrotasks();
      this.fixture.detectChanges();
    }
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
