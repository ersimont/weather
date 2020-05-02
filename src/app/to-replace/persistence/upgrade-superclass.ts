import { assert } from "app/to-replace/assert";

export interface Upgradable {
  _version: number;
}

export class UpgradeSuperclass<T extends Upgradable> {
  protected upgradeFrom: Record<
    number,
    (upgradable: T, targetVersion: number) => void
  > = {};

  upgrade(upgradable: T, fresh: T) {
    try {
      this.upgradeTo(fresh._version, upgradable);
      return upgradable;
    } catch (error) {
      this.onError(error);
      return fresh;
    }
  }

  protected upgradeFromLegacy(_upgradable: T, _targetVersion: number) {
    throw new Error("Unable to upgrade from legacy version");
  }

  protected onError(error: any) {
    throw error;
  }

  private upgradeTo(targetVersion: number, upgradable: T) {
    let lastVersion = upgradable._version;
    assert(lastVersion === undefined || lastVersion <= targetVersion);
    while (lastVersion !== targetVersion) {
      this.upgradeOneStep(upgradable, targetVersion);
      const newVersion = upgradable._version;
      assert(newVersion > lastVersion && newVersion <= targetVersion);
      lastVersion = newVersion;
    }
  }

  private upgradeOneStep(upgradable: T, targetVersion: number) {
    const version = upgradable._version;
    if (version === undefined) {
      this.upgradeFromLegacy(upgradable, targetVersion);
    } else if (this.upgradeFrom[version]) {
      this.upgradeFrom[version](upgradable, targetVersion);
    } else {
      throw new Error(`Unable to upgrade from version ${version}`);
    }
  }
}
