import { assert } from 's-js-utils';

export interface Upgradable {
  _version: number;
}

export type Upgrader<T> = (upgradable: T, targetVersion: number) => T;

export class UpgradeSuperclass<T extends Upgradable> {
  private upgraders = new Map<number | undefined, Upgrader<T>>();

  upgrade(upgradable: T, fresh: T) {
    try {
      return this.upgradeTo(fresh._version, upgradable);
    } catch (error) {
      this.onError(error);
      return fresh;
    }
  }

  protected registerVersion(
    version: number | undefined,
    upgrader: Upgrader<T>,
  ) {
    this.upgraders.set(version, upgrader.bind(this));
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
    const upgrader = this.upgraders.get(version);
    if (!upgrader) {
      throw new Error(`Unable to upgrade from version ${version}`);
    }

    return upgrader(upgradable, targetVersion);
  }
}
