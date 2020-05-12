import { assert } from 's-js-utils';

export interface Upgradable {
  _version: number;
}

export class UpgradeSuperclass<T extends Upgradable> {
  protected upgradeFrom: Record<
    number,
    (upgradable: T, targetVersion: number) => T
  > = {};

  upgrade(upgradable: T, fresh: T) {
    try {
      return this.upgradeTo(fresh._version, upgradable);
    } catch (error) {
      this.onError(error);
      return fresh;
    }
  }

  protected upgradeFromLegacy(_upgradable: T, _targetVersion: number): T {
    throw new Error('Unable to upgrade from legacy version');
  }

  protected onError(error: any) {
    throw error;
  }

  private upgradeTo(targetVersion: number, upgradable: T) {
    let lastVersion = upgradable._version;
    assert(lastVersion === undefined || lastVersion <= targetVersion);
    while (lastVersion !== targetVersion) {
      upgradable = this.upgradeOneStep(upgradable, targetVersion);
      const newVersion = upgradable._version;
      if (lastVersion) {
        assert(
          newVersion > lastVersion,
          `${lastVersion} to ${newVersion} is not an upgrade...`,
        );
      }
      assert(
        newVersion <= targetVersion,
        `${newVersion} is past the target version of ${targetVersion}`,
      );
      lastVersion = newVersion;
    }
    return upgradable;
  }

  private upgradeOneStep(upgradable: T, targetVersion: number) {
    const version = upgradable._version;
    if (version === undefined) {
      return this.upgradeFromLegacy(upgradable, targetVersion);
    } else if (this.upgradeFrom[version]) {
      return this.upgradeFrom[version](upgradable, targetVersion);
    } else {
      throw new Error(`Unable to upgrade from version ${version}`);
    }
  }
}
