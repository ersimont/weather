export abstract class AbstractComponentHarness {
  constructor(private parent: Element, private hostSelector: string) {}

  protected getHost<T extends Element>(): T {
    // Improvements:
    // - ensure there is only one
    // - ensure it is visible
    return this.get<T>(this.hostSelector, { parent: this.parent });
  }

  protected get<T extends Element>(
    selector: string,
    { text, parent = this.getHost() }: { text?: string; parent?: Element } = {},
  ): T {
    let all = Array.from(parent.querySelectorAll<T>(selector));
    if (text) {
      all = all.filter((el) => el.textContent!.includes(text));
    }
    expect(all.length)
      .withContext(".get() must match exactly 1 element")
      .toBe(1);
    return all[0];
  }
}
