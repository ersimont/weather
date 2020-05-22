import { Observable, Subscription } from 'rxjs';

type Constructor = new (...args: any[]) => {};

export function mixInSubscriptionManager<B extends Constructor>(Base: B) {
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
          next?.bind(this),
          error?.bind(this),
          complete?.bind(this),
        ),
      );
    }

    unsubscribe() {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }
  };
}

export const SubscriptionManager = mixInSubscriptionManager(Object);
