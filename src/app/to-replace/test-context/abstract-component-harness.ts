export abstract class AbstractComponentHarness {
  protected abstract getHost(): Element;

  protected get<T extends Element>(
    selector: string,
    { text, parent = this.getHost() }: { text?: string; parent?: Element } = {},
  ): T {
    let all = Array.from(parent.querySelectorAll<T>(selector));
    if (text) {
      all = all.filter((el) => el.textContent?.includes(text));
    }
    expect(all.length)
      .withContext(".get() must match exactly 1 element")
      .toBe(1);
    return all[0];
  }
}
