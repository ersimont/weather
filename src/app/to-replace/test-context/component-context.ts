import { Type } from '@angular/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  flushMicrotasks,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  AngularContext,
  extendMetadata,
} from 'app/to-replace/test-context/angular-context';
import { trimLeftoverStyles } from 'app/to-replace/trim-leftover-styles';

export abstract class ComponentContext<
  ComponentType,
  InitOptions
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

  tick(millis?: number) {
    flushMicrotasks();
    this.fixture.detectChanges();
    super.tick(millis);
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
