import { ComponentHarness } from '@angular/cdk/testing';

export class WhatsNewComponentHarness extends ComponentHarness {
  static hostSelector = 'app-whats-new';

  private getItems = this.locatorForAll('li');

  async getFeatures() {
    const items = await this.getItems();
    return Promise.all(items.map((li) => li.text()));
  }
}
