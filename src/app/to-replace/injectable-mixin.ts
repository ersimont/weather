import { OnDestroy } from "@angular/core";
import { Observable, Subject, Subscription } from "rxjs";

// https://github.com/Microsoft/TypeScript/pull/13743

type Constructor<T> = new (...args: any[]) => T;

// TODO: make some kind of fancy auto-mixin-any-class helper

export function mixInInjectable<T extends Constructor<{}>>(Base: T) {
  return class extends mixInSubscriptionManager(Base) implements OnDestroy {
    destruction$: Observable<undefined>;

    private destructionSubject = new Subject<undefined>();

    constructor(...args: any[]) {
      super(...args);
      this.destruction$ = this.destructionSubject.asObservable();
    }

    ngOnDestroy() {
      this.unsubscribe();
      this.destructionSubject.next();
      this.destructionSubject.complete();
    }
  };
}

export function mixInSubscriptionManager<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    private subscriptions = new Subscription();

    subscribeTo<T>(
      observable: Observable<T>,
      next?: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void,
    ) {
      this.subscriptions.add(
        observable.subscribe(
          this.bind(next),
          this.bind(error),
          this.bind(complete),
        ),
      );
    }

    unsubscribe() {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }

    private bind(fn?: (val?: any) => void) {
      return fn?.bind(this);
    }
  };
}
