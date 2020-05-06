import { AbstractComponentHarness } from 'app/to-replace/test-context/abstract-component-harness';

export class WhatsNewComponentHarness extends AbstractComponentHarness {
  getFeatures() {
    return this.getAll('li').map((li) => li.textContent);
  }

  isShowing() {
    // TODO: move to a framework-y way to get other-than-1 harness
    return this.getAll('app-whats-new', { parent: document.body }).length > 0;
  }

  protected getHost() {
    return this.get('app-whats-new', { parent: document.body });
  }
}
