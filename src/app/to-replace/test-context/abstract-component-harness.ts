interface GetOptions {
  text?: string;
  parent?: Element;
}

export abstract class AbstractComponentHarness {
  protected abstract getHost(): Element;

  protected get<T extends Element>(selector: string, options: GetOptions = {}) {
    const all = this.getAll<T>(selector, options);
    expect(all.length)
      .withContext(".get() must match exactly 1 element")
      .toBe(1);
    return all[0];
  }

  protected getAll<T extends Element>(
    selector: string,
    { text, parent = this.getHost() }: GetOptions = {},
  ) {
    let all = Array.from(parent.querySelectorAll<T>(selector));
    if (text) {
      all = all.filter((el) => el.textContent?.includes(text));
    }
    return all;
  }
}
