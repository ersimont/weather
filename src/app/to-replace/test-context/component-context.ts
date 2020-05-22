import { Type } from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  AngularContext,
  extendMetadata,
} from 'app/to-replace/test-context/angular-context';
import { convertTime } from 's-js-utils';
import { trimLeftoverStyles } from 's-ng-dev-utils';

export abstract class ComponentContext<
  ComponentType = unknown,
  InitOptions = {}
> extends AngularContext<InitOptions> {
  fixture!: ComponentFixture<unknown>;
  protected abstract componentType: Type<ComponentType>;

  constructor(moduleMetadata: TestModuleMetadata) {
    super(
      extendMetadata(moduleMetadata, {
        imports: [NoopAnimationsModule],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
      }),
    );
  }

  tick(amount = 0, unit = 'ms') {
    flushMicrotasks();
    this.fixture.detectChanges();
    tick(convertTime(amount, unit, 'ms'));
  }

  protected init(_options: Partial<InitOptions>) {
    trimLeftoverStyles();
    super.init(_options);
    this.fixture = TestBed.createComponent(this.componentType);
    this.fixture.detectChanges();
    this.tick();
  }

  protected cleanUp() {
    this.fixture.destroy();
    super.cleanUp();
  }
}
