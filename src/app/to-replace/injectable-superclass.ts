import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { mixInSubscriptionManager } from './subscription-manager';

type Constructor<T> = new (...args: any[]) => T;

export function mixInInjectableSuperclass<B extends Constructor<{}>>(Base: B) {
  return class extends mixInSubscriptionManager(Base) implements OnDestroy {
    /**
     * An observable that emits once when this object is destroyed, then completes.
     */
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

export const InjectableSuperclass = mixInInjectableSuperclass(Object);
