import { assert } from "app/to-replace/assert";
import {
  Upgradable,
  UpgradeSuperclass,
} from "app/to-replace/persistence/upgrade-superclass";

export class Persistence<T extends Upgradable> {
  constructor(private key: string) {}

  get(): T | undefined;
  get(opts: { defaultValue: T; upgrader?: UpgradeSuperclass<T> }): T;
  get({
    defaultValue,
    upgrader,
  }: { defaultValue?: T; upgrader?: UpgradeSuperclass<T> } = {}) {
    const savedStr = localStorage.getItem(this.key);
    if (savedStr === null) {
      return defaultValue;
    }

    const saved = JSON.parse(savedStr);
    if (upgrader) {
      assert(defaultValue);
      upgrader.upgrade(saved, defaultValue);
    }
    return saved;
  }

  put(state: T) {
    localStorage.setItem(this.key, JSON.stringify(state));
  }
}
