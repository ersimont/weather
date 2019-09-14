import { StoreObject } from "ng-app-state";
import { SubscriptionManager } from "s-rxjs-utils";

export function persistStore<T>(
  store: StoreObject<T>,
  key: string,
  subscriptionManager = new SubscriptionManager(),
) {
  const initialValue = localStorage.getItem(key);
  if (initialValue) {
    store.set(JSON.parse(initialValue));
  }
  subscriptionManager.subscribeTo(store.$, (state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
}
